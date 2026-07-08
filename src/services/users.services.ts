import { eq } from "drizzle-orm";
import { db } from "../db"
import { user } from "../db/schema";


//========== GET ALL USERS ========
// Fetches and returns every row from the users table 

export async function getALLUsers(){
    // SELECT * FROM users 
    return db.select().from(user)
}  

// * GET USER BY ID
// Fetches and returns every row from the user table 
export async function getUserById(id: number) {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0] ?? null;
}



// ========== CREATE USER =============
// INSERTS a new user with provided email address 
// Returns the newly created user object 


export async function createUser(email: string){
    const result = await db.insert(user).values({email}).returning();
    return result[0] ?? null;
}