import {Router} from "express"
import { createUserController, deleteUserByIdController, getAllUsersController, getUserByIdController } from "../controllers/users.controllers"

const router = Router();

router.post("/", createUserController);
router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.delete("/:id", deleteUserByIdController);

export default router;