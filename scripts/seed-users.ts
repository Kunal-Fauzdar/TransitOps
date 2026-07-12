import fs from 'fs'
import path from 'path'
import neo4j from 'neo4j-driver'
import bcrypt from 'bcryptjs'

// Simple helper to load .env.local manually if run outside of Next.js context
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        // Remove surrounding quotes if any
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1)
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1)
        }
        process.env[key] = value
      }
    })
  }
}

loadEnvLocal()

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
const user = process.env.NEO4J_USERNAME || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'
const database = process.env.NEO4J_DATABASE

console.log(`Connecting to Neo4j at ${uri} (database: ${database || 'default'}) for seeding users...`)

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

const TEST_USERS = [
  {
    id: 'user_fleet_manager_01',
    name: 'Fleet Manager User',
    email: 'manager@transitops.com',
    password: 'password123',
    role: 'FleetManager',
  },
  {
    id: 'user_driver_01',
    name: 'Driver User',
    email: 'driver@transitops.com',
    password: 'password123',
    role: 'Driver',
  },
  {
    id: 'user_safety_officer_01',
    name: 'Safety Officer User',
    email: 'safety@transitops.com',
    password: 'password123',
    role: 'SafetyOfficer',
  },
  {
    id: 'user_financial_analyst_01',
    name: 'Financial Analyst User',
    email: 'analyst@transitops.com',
    password: 'password123',
    role: 'FinancialAnalyst',
  },
]

async function seedUsers() {
  const session = driver.session(database ? { database } : {})
  try {
    console.log('Starting user seeding...')

    for (const u of TEST_USERS) {
      const passwordHash = await bcrypt.hash(u.password, 10)
      console.log(`Checking/Creating user: ${u.email} (${u.role})`)

      await session.executeWrite((tx) =>
        tx.run(
          `
          MERGE (user:User {email: $email})
          ON CREATE SET 
            user.id = $id,
            user.name = $name,
            user.passwordHash = $passwordHash,
            user.role = $role
          ON MATCH SET
            user.name = $name,
            user.passwordHash = $passwordHash,
            user.role = $role
          RETURN user
          `,
          {
            id: u.id,
            name: u.name,
            email: u.email,
            passwordHash,
            role: u.role,
          }
        )
      )
    }

    console.log('✓ Successfully seeded all test users!')
  } catch (error) {
    console.error('Error seeding users:', error)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

seedUsers()
