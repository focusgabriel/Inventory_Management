import type { Request, Response } from "express";
import { createBulkProducts, createProduct, getAllProducts } from "../services/products.services";

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

//  ==================== BULK CREATE PRODUCTS CONTROLLER ================
export async function createBulkProductsControllers(req:Request, res:Response){
  try{
    const productsData = req.body;
    // check if it's an array and not empty
    if(!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({error: "Request body must be a non-empty array of products"});
    }

    const validateProducts = [];
    const errors = [];

    for(let i = 0; i < productsData.length; i++){
      const {name, currentPrice, stockQuantity} = productsData[i];

      let isValid = true;
      let errorMsg = null;

      // validate Name
      if(!name || typeof name !== "string" || name.trim() === "") {
        isValid = false,
        errorMsg = "Name is required and must be a non-empty string";
      }
      // validate currentPrice
      else if(currentPrice === undefined || currentPrice === null || currentPrice === "") {
        isValid =false,
        errorMsg = "currentPrice is required";
      }
      else if(isNaN(Number(currentPrice)) || Number(currentPrice) < 0) {
        isValid = false;
        errorMsg = "currentPrice must be a valid non-negative number";
      }
      // Validate stockQuantity (opional but must be valid if present)
      else if(stockQuantity !== undefined && stockQuantity !== null ) {
        if(isNaN(Number(stockQuantity)) || !Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0){
          isValid = false,
          errorMsg = "stockQuantity must be a non-negative integer";
        }
      }
      
      if(!isValid) {
        errors.push({index: i, product: productsData[i], error: errorMsg});
      } else {
        validateProducts.push({
          name: name.trim(),
          currentPrice: String(currentPrice),
          stockQuantity: stockQuantity !== undefined && stockQuantity !== null ? Number(stockQuantity) : 0
        });
      }
    }

    //  3. if there are validations errors , return them instead of inserting 
    if(errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed for some products",
        failedItems: errors
      });
    }

    const createdProducts = await createBulkProducts(validateProducts);
    res.status(400).json({
      message: `Successfully created ${createdProducts.length} products`,
      products: createdProducts
    })

  } catch(error) {
    console.error("Error bulk creating products:", error)
    res.status(500).json({error: "Failed to bulk create products"});
  }
}