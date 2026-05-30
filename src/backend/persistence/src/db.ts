import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export type Database = ReturnType<typeof drizzle>

export function createDatabase(connectionString: string): Database {
  const client = postgres(connectionString, { prepare: false })
  return drizzle(client)
}
