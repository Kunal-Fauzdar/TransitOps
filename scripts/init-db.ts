import fs from 'fs'
import path from 'path'
import neo4j from 'neo4j-driver'

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

console.log(`Connecting to Neo4j at ${uri} (database: ${database || 'default'})...`)

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

async function runConstraints() {
  const session = driver.session(database ? { database } : {})
  try {
    console.log('Creating constraints...')

    // Constraint 1: Vehicle regNumber unique
    await session.run(`
      CREATE CONSTRAINT vehicle_reg_unique IF NOT EXISTS
      FOR (v:Vehicle)
      REQUIRE v.regNumber IS UNIQUE
    `)
    console.log('✓ Vehicle regNumber constraint check/creation complete.')

    // Constraint 2: Driver licenseNumber unique
    await session.run(`
      CREATE CONSTRAINT driver_license_unique IF NOT EXISTS
      FOR (d:Driver)
      REQUIRE d.licenseNumber IS UNIQUE
    `)
    console.log('✓ Driver licenseNumber constraint check/creation complete.')

    // Constraint 3: User email unique
    await session.run(`
      CREATE CONSTRAINT user_email_unique IF NOT EXISTS
      FOR (u:User)
      REQUIRE u.email IS UNIQUE
    `)
    console.log('✓ User email constraint check/creation complete.')

    console.log('All Neo4j database constraints have been initialized successfully!')
  } catch (error) {
    console.error('Error establishing constraints in Neo4j database:', error)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

runConstraints()
