import { Request } from "express";
import { connectClient } from "../database/config";
import { IData, convertCsvFile } from "../middlewares/convertCsvFile.middleware";

async function updateProductService(req:Request ){
    const client = await connectClient()
    const reqPath:any = req.file?.path
    const results:IData[]  = await convertCsvFile(reqPath)

    for(const data of results){

        const [result]:any = await client.query('UPDATE products SET sales_price = ? WHERE code = ?',[data.new_price, data.product_code])
        console.log(result)
    }


    // const teste = results.map(async (result)=>{
    //     const teste2 = await client.query('UPDATE products SET sales_price = ? WHERE code = ?', [result.new_price, result.product_code])
    //     console.log(teste2)
    //     return teste2
    // })

    // return teste

}

export { updateProductService}