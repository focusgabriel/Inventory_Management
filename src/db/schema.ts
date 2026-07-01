// Import Drizzle's PostgresSQL table-building helpers: 
// pgTable -defines a table in PostgresSQL
// serial - auto-incrementing integer primary key
// text - variable-length string column
// timestamp - date/time column
// integer - whole number column
// 

import {pgTable, serial, text, timestamp, numeric, integer} from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

