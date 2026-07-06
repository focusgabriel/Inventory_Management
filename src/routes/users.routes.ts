import {Router} from "express"
import { createUserController } from "../controllers/users.controllers"

const router = Router();

router.post("/", createUserController);

export default router;