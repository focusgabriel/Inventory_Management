import type { Request, Response } from "express";
import { createProduct, getAllProducts } from "../services/products.services";

export async function CreateProductController(req:Request, res:Response) {
  try{
    const {name, currentPrice, stockQuantity} = req.body;

    if(!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({error: "Name is required and must be a non-empty string"});
    }

    if(currentPrice === undefined || currentPrice === null || currentPrice === "") {
      return res.status(400).json({error: "currentPrice is required"});
    }

    if(isNaN(Number(currentPrice)) || Number(currentPrice) < 0){
      return res.status(400).json({error: "currentPrice must be a valid number"});
    }

    if(stockQuantity !== undefined && stockQuantity !== null) { 
      if(isNaN(Number(stockQuantity)) || !Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0) {
        return res.status(400).json({error: "stockQuantity must be a non-negative integer"});
      }
    }

    const priceStr = String(currentPrice);
    const product = stockQuantity !== undefined 
      ? await createProduct(name.trim(), priceStr, Number(stockQuantity))
      : await createProduct(name.trim(), priceStr);
    res.status(201).json(product);
  } catch(error) {
    console.error("Error creating product:", error);
    res.status(500).json({error: "Failed to create product"})
  }
}

export async function getAllProductsController(_req:Request, res:Response){
  try{
    const proudcts = await getAllProducts();
    res.json(proudcts);
  } catch(error) {
    console.error("Error fetching products", error);
    res.status(500).json({error: "Error fetching products"})
  }
}