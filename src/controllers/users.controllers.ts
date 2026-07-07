import type { Request, Response} from "express";
import { createUser, getALLUsers, getUserById } from "../services/users.services";

export async function getAllUsersController(_req: Request, res:Response){
  try{
    const users = await getALLUsers();
    res.json(users);
  } catch(error){
    console.error("Error fetching users:", error);
    res.status(500).json({error: "Failed to fetch users"})
  }
}

export async function createUserController(req: Request, res: Response) {
  try {
    const {email} = req.body;
    if(!email || typeof email !== "string" || email.trim() === ""){
      return res.status(400).json({error: "Email is required and must be a non-empty string"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.trim())) {
      return res.status(400).json({error: "Invalid email format"});
    }

    const user = await createUser(email.trim().toLowerCase());
    res.status(201).json(user);
  } catch (error: any) {
    // PostgreSQL unique constraints violation code = 23505(email already exists)
    if(error?.code === "23505"){
      return res.status(409).json({error: "This email is already registered"});
    }
    console.log("Error creating user :", error);
    if(process.env.NODE_ENV !== "production"){
      return res.status(500).json({
        error: "Failed to create user",
        details: error?.message,
        code: error?.code,
        stack: error?.stack
      });
    }
    // console.log(`Error creating user:${error}`);
    res.status(500).json({newError: "Failed to create user"});
  };
}

export async function getUserByIdController(req: Request, res: Response){
  try{
    const id = Number(req.params.id);

    if(isNaN(id) || id <= 0){
      return res.status(400).json({error: "Invalid User ID. Must be a positive number" })
    }

    const user = await getUserById(id);
    if(!user) {
      return res.status(404).json({error: "User not found"});
    }

    res.json(user);
  } catch(error) {
    console.error("Error fetching user", error)
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}