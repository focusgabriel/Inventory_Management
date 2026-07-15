import type { NextFunction, Request, Response} from "express";
import { createUser, deleteUser, getALLUsers, getUserById } from "../services/users.services";
import { sendCreated } from "../lib/response";
import { Errors } from "../lib/AppError";

export async function getAllUsersController(_req: Request, res:Response){
  try{
    const users = await getALLUsers();
    res.json(users);
  } catch(error){
    console.error("Error fetching users:", error);
    res.status(500).json({error: "Failed to fetch users"})
  }
}

export async function createUserController(req: Request, res: Response, next:NextFunction) {
  try {
    const {email} = req.body as {email?: unknown};
    if(!email || typeof email !== "string" || email.trim() === ""){
      throw Errors.badRequest("Email is required and must be a non-empty string", "INVALID_EMAIL")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.trim())) {
      throw Errors.badRequest("Invalid email format", "iNVALID_EMAIL");
    }

    const user = await createUser(email.trim().toLowerCase());
    sendCreated(res, user, "User created successfully.")
  } catch (err) {
    // if anything goes wrong(validation fails, database is down, duplicate email), the error is caught here and passed to next(err);
    next(err)
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

export async function deleteUserByIdController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    
    if(isNaN(id) || id <= 0){
      return res.status(400).json({error: "Invalid User ID. Must be a positive number" })
    }
    const user = await deleteUser(id);
    
    if(!user){
      return res.status(404).json({error: "User not found"});
    }

    res.json(user);
  } catch (error) {
    console.log("Error deleting user: ", error);
    res.status(500).json({error: "Failed to delete user"});
  }
}