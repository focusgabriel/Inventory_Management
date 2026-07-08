// Import Drizzle's PostgresSQL table-building helpers: 
// pgTable -defines a table in PostgresSQL
// serial - auto-incrementing integer primary key
// text - variable-length string column
// timestamp - date/time column
// integer - whole number column
// 

import {pgTable, serial, text, timestamp, numeric, integer} from "drizzle-orm/pg-core";
export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

//  ======================= PRODUCTS TABLE =============================
// stores inventory products available for purchase

export const products = pgTable('products', {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentPrice: numeric("current_price").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0)
})

// ===================== ORDERS TABLE ===========================
// Stores customer Orders. Each order belongs to one user and can have many items.

export const orders = pgTable('orders', {
  id: serial("id").primaryKey(),

  // Foreign Key referencing the users table - ensures the order belongs to a valid user
  userId: integer("user_id").notNull().references(() => user.id).notNull(),

  // Total order amount stored as a numeric value for precise calculation.
  totalAmount: numeric("total_amount").notNull(),
  status: text("status").notNull().default('pending'),

  // Timestamp of when the order was created(auto-set to current time)
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// ====================== ORDER ITEMS TABLE ========================
// Stores individual like  
export const orderItems = pgTable("order_items", {
  //  Primary Key: auto-incrementing integer
  id: serial("id").primaryKey(),

  // Foreign Key referencing the orders table - links this item to a specific order
  orderId: integer("order_id").references(() => orders.id).notNull(),

  // Foreign Key inferencing the products table - identifies which product was ordered 
  productId: integer("product_id").references(() => products.id).notNull(),

  // How many units of this product were ordered
  quantity: integer("quantity").notNull(),
  
  // The price of the product at the time of purchase (snapshot, since prices may change later)
  priceAtPurchase: numeric("price_at_purchase").notNull(), 

});