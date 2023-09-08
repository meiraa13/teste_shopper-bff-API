import { Request, Response } from "express";
import { readDataService } from "../services/readData.service";
import { validateCsvService } from "../services/validateCsv.service";
import { updateProductService } from "../services/updateProduct.service";


async function readDataController(req:Request, res:Response):Promise<Response>{
    
   const products = await readDataService()
   

   return res.json(products)
}

async function validateCsvController(req:Request, res:Response):Promise<Response>{
  const validatedProduct = await validateCsvService(req)
  for(const product of validatedProduct){
    if("errorMessage" in product){
      return res.status(409).json(validatedProduct)
    }
  }


  return res.json(validatedProduct)

}
  
async function updateProductController(req:Request, res:Response):Promise<Response>{
  const updatedProduct = await updateProductService(req)

  return res.json(updatedProduct)

}





export { readDataController, validateCsvController, updateProductController }