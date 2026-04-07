// Database connection
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString || connectionString.includes('dummy')) {
  console.log('⚠️  Database not configured - running in UI-only mode')
}

const client = connectionString && !connectionString.includes('dummy') 
  ? postgres(connectionString)
  : null

export const db = client ? drizzle(client, { schema }) : null

