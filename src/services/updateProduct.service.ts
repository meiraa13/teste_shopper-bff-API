import { Request } from "express";
import { connectClient } from "../database/config";
import { IData, convertCsvFile } from "../middlewares/convertCsvFile.middleware";

async function updateProductService(req:Request ):Promise<void>{
    const client = await connectClient()
    const reqPath:any = req.file?.path
    const results:IData[]  = await convertCsvFile(reqPath)

    for(const data of results){

        const [result]:any = await client.query('UPDATE products SET sales_price = ? WHERE code = ?',[data.new_price, data.product_code])
       
    }

}

export { updateProductService}