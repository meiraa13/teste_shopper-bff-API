import { Request, Response } from "express";
import { connectClient } from "../database/config";
import { AppError } from "../error";
import { IData, convertCsvFile } from "../middlewares/convertCsvFile.middleware";

interface IProduct{
    code:number,
    name:string,
    cost_price:string,
    sales_price:string
}

async function validateCsvService(req:Request ){
    const client = await connectClient()
    const reqPath:any = req.file?.path
    const results:IData[]  = await convertCsvFile(reqPath)
    const newPriceNumber = Number(results[0].new_price)

    if(isNaN(newPriceNumber)){
        throw new AppError('preço nao é um número válido',400)
    }

    for(const obj of results){
        if(!obj.hasOwnProperty('product_code')){
            throw new AppError('falta codigo do produto',400)
        }
        if(!obj.hasOwnProperty('new_price')){
            throw new AppError('falta preço do produto',400)
        }
    }

    const [queryResult]:any = await client.query('SELECT * FROM products WHERE code = ?',[results[0].product_code])
    if(queryResult.length == 0){
        throw new AppError('produto nao encontrado',404)
    }
    
    const queryObj:IProduct = queryResult[0]
    const currentPriceNumber = Number(queryObj.sales_price)
    const currentCostNumber = Number(queryObj.cost_price)
    
    if(newPriceNumber < currentCostNumber){
        throw new AppError('novo preço está abaixo do custo',400)
    }

    if(newPriceNumber > currentPriceNumber * 1.1 || newPriceNumber < currentPriceNumber * 0.9){
        throw new AppError('preço está acima ou abaixo do permitido pelo time de marketing', 400)
    }


    const returnObj = {
        codigo: queryObj.code,
        nome: queryObj.name,
        preco_atual: queryObj.sales_price,
        preco_novo: results[0].new_price
    }

    return returnObj



    // const csvData = req.file?.buffer.toString()

    // const keys = csvData?.split('\r\n')[0].split(',')
    // const values = csvData?.split('\r\n')[1].split(',')

    // const newObj = {
    //     product_code: Number(values![0]),
    //     new_price: Number(values![1])
    // }
    
    // const [result ]:any = await client.query('SELECT sales_price FROM products WHERE code = ?',[values![0]])

   
    // if(result[0].sales_price < Number(values![1]) * 10){
    //     throw new AppError('Valor muito alto', 400)
    // }

    


    // const keyValuePairs = csvData!.split('\r\n')[1].split(',').map((item, index) => {
    //     const keys = ["product_code", "new_price"];
    //     return `${keys[index]}: ${item}`;
    //   });
      
    //   const result = keyValuePairs.join(', ');
      
    //   return result

}


export { validateCsvService }