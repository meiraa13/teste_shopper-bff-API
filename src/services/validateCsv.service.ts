import { Request, Response } from "express";
import { connectClient } from "../database/config";
import { AppError } from "../error";
import { IData, convertCsvFile } from "../middlewares/convertCsvFile.middleware";

export interface IProduct{
    code:number,
    name:string,
    cost_price:string,
    sales_price:string,
    new_price?:string,
    pack?:boolean,
    item_id?:Array<number>,
    item_qty?:number,
    has_pack:boolean,
    pack_id:number,
    errorMessage?:string
}


async function validateCsvService(req:Request ):Promise<IProduct[]>{
    const client = await connectClient()
    const reqPath:any = req.file?.path
    const csvData:IData[] = await convertCsvFile(reqPath)
    const returnArr:IProduct[] = []

    for(const product of csvData){
        if( Number(product.product_code) >=  1000 && Number(product.product_code) <= 1020 ){
    
            const [query]:any = await client.query("SELECT * FROM packs WHERE pack_id = ?",[product.product_code])
        
            product.product_code = query[0].pack_id
            product['pack'] = true
            query.length == 2 ? product['item_id'] = [query[0].product_id, query[1].product_id]: product['item_id'] = [query[0].product_id]
            product['item_qty'] = query[0].qty
            
        }

        const[findPack]:any = await client.query("SELECT * FROM packs WHERE product_id = ?", [product.product_code])
       
        if(findPack[0]){
            product['has_pack'] = true
            product['pack_id'] = findPack[0].pack_id
        }
        
        
        if(!("product_code" in product)){
            throw new AppError("Está faltando o código do produto", 404)
        }
        if(!("new_price" in product)){
            throw new AppError("Está faltando o novo preço do produto", 404)
        }
        
        const newPriceToNumber = Number(product.new_price)
        if(isNaN(newPriceToNumber)){
            throw new AppError("Preço não é um número válido", 400)
        }
        
        const [queryResult]:any = await client.query("SELECT * FROM products WHERE code = ?",[product.product_code])
        if(queryResult.length === 0){
            throw new AppError("Nenhum produto encontrado com o código informado", 404)
        }
        
        const currentProduct = queryResult[0]

        currentProduct['new_price'] = product.new_price
        if(product.pack){
            currentProduct['item_id'] = product.item_id
            currentProduct['item_qty'] = product.item_qty
            currentProduct['pack'] = true
        }else if(product.has_pack){
            currentProduct['has_pack'] = true
            currentProduct['pack_id'] = product.pack_id
        }

        if(newPriceToNumber > Number(currentProduct.sales_price) * 1.1){
            currentProduct["errorMessage"] = `Preço R$ ${newPriceToNumber} está acima do permitido pelo marketing`
        }
        if(newPriceToNumber < Number(currentProduct.sales_price) * 0.9){
            currentProduct["errorMessage"] = `Preço R$ ${newPriceToNumber} está abaixo do permitido pelo marketing`
        }
        
        if(newPriceToNumber < Number(currentProduct.cost_price)){
            currentProduct["errorMessage"] = `Preço R$ ${newPriceToNumber} está abaixo do custo`
        }

        returnArr.push(currentProduct)

        
    }
   
    const pack = returnArr.find((product)=> product.pack)
    const item1FromPack = returnArr.find((product)=>product.code == pack?.item_id![0])
    const item2FromPack = returnArr.find((product)=>product.code == pack?.item_id![1])


    if(pack && !item1FromPack && !item2FromPack){
        throw new AppError("Favor informar o item que pertence ao pacote", 409)
    }

    if(item1FromPack){
        const salesDiff = Number(item1FromPack.new_price) - Number(item1FromPack?.sales_price)
        const roundedNumber = Number(salesDiff.toFixed(1))
        console.log(salesDiff)
        const sum = Number(pack?.sales_price) + roundedNumber
        const roundedSum = Number(sum.toFixed(1))
        console.log(roundedSum)
        
        if(Number(pack?.new_price) !== roundedSum){
            throw new AppError("Precisa ajustar o preço do pacote ou do item", 409)
        }
    }

    if(item2FromPack){
        const salesDiff = Number(item2FromPack?.new_price) - Number(item2FromPack?.sales_price)
        const roundedNumber = Number(salesDiff.toFixed(1))
        const sum = Number(pack?.sales_price) + roundedNumber
        const roundedSum = Number(sum.toFixed(1))
        if(Number(pack?.new_price) !== roundedSum){
            throw new AppError("Precisa ajustar o preço do pacote ou do item", 409)
        }
    }

    // if(pack && !itemFromPack){
    //     throw new AppError("Favor informar o código e preço do item que pertence ao pacote", 404)
    // }else if(pack){
    //     if(Number(itemFromPack?.new_price) * Number(pack?.item_qty) !== Number(pack?.new_price)){
    //         throw new AppError("O preço do item ou do pacote não estão em conformidade", 409)
    //     }
    // }
          
    // const item = returnArr.find((product)=> product.has_pack)
    // const packFromItem = returnArr.find((product)=> product.code == item?.pack_id)
  

    // if(item && !packFromItem){
    //     throw new AppError("Favor informar o pack também", 404)
    // }else if(item){
    //     if(Number(item.new_price) * Number(packFromItem?.item_qty) !== Number(packFromItem?.new_price)){
    //         throw new AppError("O preço do item ou do pacote não estão em conformidade", 409)
    //     }
    // }
    

   

    return returnArr

   

}


export { validateCsvService }