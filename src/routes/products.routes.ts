import {Router} from "express";
import { CreateProductController } from "../controllers/product.controllers";

const router = Router()

router.post("/", CreateProductController)

export default router;