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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const session = getSession()
        try {
          // Fetch user node by email
          const result = await session.run(
            `
            MATCH (u:User {email: $email})
            RETURN u { .id, .name, .email, .passwordHash, .role } AS user
            LIMIT 1
            `,
            { email: credentials.email }
          )

          if (result.records.length === 0) {
            throw new Error('No user found with this email')
          }

          const userRecord = result.records[0].get('user')

          // Verify password hash
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            userRecord.passwordHash
          )

          if (!isPasswordCorrect) {
            throw new Error('Invalid email or password')
          }

          // Return user object without the password hash
          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            role: userRecord.role as UserRole,
          }
        } catch (error) {
          console.error('Error during authorization:', error)
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
