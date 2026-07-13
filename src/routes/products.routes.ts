import {Router} from "express";
import { createBulkProductsControllers, CreateProductController, getAllProductsController } from "../controllers/product.controllers";

const router = Router()

router.post("/addProduct", CreateProductController)
router.get("/", getAllProductsController)
router.post("/", createBulkProductsControllers)


export default router;