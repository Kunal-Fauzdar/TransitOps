import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/neo4j'
import { UserRole } from '@/lib/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'manager@transitops.com' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        console.log('🔑 NextAuth authorize called with email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ Missing credentials');
          throw new Error('Please enter an email and password')
        }

        const session = getSession()
        try {
          const result = await session.run(
            `
            MATCH (u:User {email: $email})
            RETURN u { .id, .name, .email, .passwordHash, .role } AS user
            LIMIT 1
            `,
            { email: credentials.email }
          )

          console.log('👤 DB check user count:', result.records.length);
          if (result.records.length === 0) {
            console.error('❌ No user found with email:', credentials.email);
            return null
          }

          const userRecord = result.records[0].get('user')
          console.log('👤 DB User role:', userRecord.role);

          if (!userRecord.passwordHash) {
            console.error('❌ User node is missing passwordHash');
            return null
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            userRecord.passwordHash
          )
          console.log('🔐 Password correct:', isPasswordCorrect);

          if (!isPasswordCorrect) {
            console.error('❌ Password mismatch');
            return null
          }

          // Check role if passed in credentials
          if (credentials.role && userRecord.role !== credentials.role) {
            console.error(`❌ Role mismatch: DB says ${userRecord.role}, credentials request has ${credentials.role}`);
            return null
          }

          console.log('✅ Auth success!');
          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            role: userRecord.role as UserRole,
          }
        } catch (error) {
          console.error('❌ Error during authorization:', error)
          return null
        } finally {
          await session.close()
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
