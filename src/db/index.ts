// Database connection - optional for local UI testing

let db: any = null

try {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')) {
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres = await import('postgres')

    const client = postgres.default(process.env.DATABASE_URL)
    db = drizzle(client)
    console.log('✅ Database connected')
  } else {
    console.log('⚠️  Database not configured - running in UI-only mode')
  }
} catch (error) {
  console.log('⚠️  Database connection failed - running in UI-only mode')
}

export { db }
