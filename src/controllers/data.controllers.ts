import { Request, Response } from "express";
import { readDataService } from "../services/readData.service";
import csv from "csv-parser"
import fs from "fs"
import { validateCsvService } from "../services/validateCsv.service";
import { updateProductService } from "../services/updateProduct.service";


async function readDataController(req:Request, res:Response){
    
   const products = await readDataService()
   

   return res.json(products)
}

async function validateCsvController(req:Request, res:Response){
  const validatedProduct = await validateCsvService(req)
   
  return res.json(validatedProduct)
}
  
async function updateProductController(req:Request, res:Response){
  const updatedProduct = await updateProductService(req)

  return res.json(updatedProduct)

}





export { readDataController, validateCsvController, updateProductController }