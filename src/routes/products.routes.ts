import {Router} from "express";
import { CreateProductController, getAllProductsController } from "../controllers/product.controllers";

const router = Router()

router.post("/", CreateProductController)
router.get("/", getAllProductsController)

export default router;