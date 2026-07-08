import { db } from "../db";
import { products } from "../db/schema";

// =============== CREATE PRODUCT ==================
// Inserts a new products with the given name, price, and optional stock quantity
// stockQuantity defaults to 0 if not provided
// Returns the newly created product object

export async function createProduct(name:string, currentPrice: string, stockQuantity:number = 0) {
  // Insert INTO products (name, current_price, stock_quantity) Values (?, ?, ?)RETURNING *
  const result = await db.insert(products).values({name, currentPrice, stockQuantity}).returning();
  // Return the inserted row, or null if insertion returned nothing 
  return result[0] ?? null;
}


export async function createBulkProducts(
  productsData: {name:string, currentPrice: string, stockQuantity:number}[]
) {
  const result = await db.insert(products).values(productsData).returning();

  return result; // returns an array of all the newly created producted
}

export async function getAllProducts(){
  return db.select().from(products);
}