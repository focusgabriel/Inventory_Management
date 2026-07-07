import {Router} from "express"
import { createUserController, getAllUsersController } from "../controllers/users.controllers"

const router = Router();

router.post("/", createUserController);
router.get("/", getAllUsersController);

export default router;