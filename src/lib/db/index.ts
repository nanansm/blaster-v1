import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Singleton pattern for PG Pool - prevents memory exhaustion
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Max connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      await pool?.end();
      pool = null;
    });
  }
  return pool;
}

// Singleton Drizzle instance
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export { getPool };
export * from "./schema";

// Re-export commonly used Drizzle operators
export { eq, desc, asc, and, or, sql, gt, lt, gte, lte, inArray, like } from "drizzle-orm";
