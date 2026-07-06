import {defineConfig} from "drizzle-kit"
import 'dotenv/config';

export default defineConfig({
  // Path to the typescript file that define the database schema (table, relationships)
  schema: "./src/db/schema.ts",
  out: "./drizzle",

  // *specifies the database typ - postgress in this case 
  dialect: "postgresql",

  // the database connection URL loaded from the .env file (the "!" asserts it's non-null)
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true,
});