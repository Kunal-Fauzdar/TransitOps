import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
const user = process.env.NEO4J_USERNAME || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'

// To prevent creating multiple drivers on hot-reload in Next.js development
const globalForNeo4j = globalThis as unknown as {
  neo4jDriver: typeof neo4j.Driver | undefined
}

export const driver = globalForNeo4j.neo4jDriver ?? neo4j.driver(uri, neo4j.auth.basic(user, password))

if (process.env.NODE_ENV !== 'production') {
  globalForNeo4j.neo4jDriver = driver
}

export function getSession() {
  const database = process.env.NEO4J_DATABASE
  return driver.session(database ? { database } : {})
}
