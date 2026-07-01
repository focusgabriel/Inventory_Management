import {drizzle} from "drizzle/node-postgres"
import {Pool} from "pg"
import 'dotenv/config' 

// Import all table definitions from the local schema file.
// The 'as schema' alias groups them so Drizzile can map table names to their definitions.
import * as schema from "./schema"

// Create a new connection pool using the Database_URL from the environment
// A pool maintains multiple reuseable connections for better performance

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, {schema});
