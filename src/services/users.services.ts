import { db } from "../db";
import { users } from "../db/schema";


// ============= GET ALL USERS ===================
// Fetch and returns every row from the users table

// export async function getUserById(email: string) {
//   const result = await db.select().from(users).where(eg(users.id, id));
//   return result[0] ?? de
// }

// ============= CREATE USER ==============
// Inserts a new user with the provided email address 
// Returns the newly created user object

export async function createUser(email:string) {
  const result = await db.insert(users).values({email}).returning();
  return result[0] ?? null;
}

