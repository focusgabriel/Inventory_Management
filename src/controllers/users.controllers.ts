import type { Request, Response} from "express";
import { createUser } from "../services/users.services";
export async function createUserController(req: Request, res: Response) {
  try {
    const {email} = req.body;
    if(!email || typeof email !== "string" || email.trim() === ""){
      return res.status(400).json({error: "Email is required and must bea a non-empty string"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.trim())) {
      return res.status(400).json({error: "Invalid email format"});
    }

    const user = await createUser(email.trim().toLowerCase());
    res.status(201).json(user);
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(201).json({error: "Failed to create user"});
  }
}
