import { Request } from "express";
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
    has_pack?:boolean,
    pack_id?:number,
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
    const itemHasPack = returnArr.find((product)=>product.has_pack)
    
    if(pack){
        const item1FromPack = returnArr.find((product)=>product.code == pack?.item_id![0])
        const item2FromPack = returnArr.find((product)=>product.code == pack?.item_id![1])
        
        if(!item1FromPack && !item2FromPack){
            pack["errorMessage"] = "Informar o item que pertence ao pack"
        }
        
        const packItem1 = pack.item_id![0]
        const packItem2 = pack.item_id![1]
    

        if(packItem1 && !packItem2 || !packItem1 && packItem2){

            if(item1FromPack && !item2FromPack){
                const itemPriceToNumber = Number(item1FromPack.new_price)
                const roundedItemPrice = Number(itemPriceToNumber.toFixed(1))
                const packPriceToNumber = Number(pack.new_price)
                const roundedPackPrice = Number(packPriceToNumber.toFixed(1))
        
                const multiplyOperation = roundedItemPrice * Number(pack.item_qty)
                const roundedMultiply = Number(multiplyOperation.toFixed(1))
                if(roundedMultiply !== roundedPackPrice){
                        item1FromPack["errorMessage"] = "Preço em não conformidade com pacote"
                }
            }
    
            if(!item1FromPack && item2FromPack){
                const itemPriceToNumber = Number(item2FromPack.new_price)
                const roundedItemPrice = Number(itemPriceToNumber.toFixed(1))
                const packPriceToNumber = Number(pack.new_price)
                const roundedPackPrice = Number(packPriceToNumber.toFixed(1))
        
                const multiplyOperation = roundedItemPrice * Number(pack.item_qty)
                const roundedMultiply = Number(multiplyOperation.toFixed(1))
                if(roundedMultiply !== roundedPackPrice){
                    item2FromPack["errorMessage"] = "Preço em não conformidade com pacote"
                }
            }

        }
        
        
        if(packItem1 && packItem2){
            if(item1FromPack && !item2FromPack){
                const roundedNewItemPrice = Number(Number(item1FromPack.new_price).toFixed(1))
                const roundedCurrentItemPrice = Number(Number(item1FromPack.sales_price).toFixed(1))
                const increaseAmount = roundedNewItemPrice - roundedCurrentItemPrice
                const roundedNewPackPrice = Number(Number(pack.new_price).toFixed(1))
                const roundedCurrentPackPrice = Number(Number(pack.sales_price).toFixed(1))
                
                const multiplyOperation = increaseAmount * Number(pack.item_qty)
                const roundedMultiply = Number(multiplyOperation.toFixed(1))
                if(roundedNewPackPrice !== roundedCurrentPackPrice + roundedMultiply ){
                    item1FromPack["errorMessage"] = "Preço em não conformidade com pacote"
                }
            }
            
            if(!item1FromPack && item2FromPack){
                const roundedNewItemPrice = Number(Number(item2FromPack.new_price).toFixed(1))
                const roundedCurrentItemPrice = Number(Number(item2FromPack.sales_price).toFixed(1))
                const increaseAmount = roundedNewItemPrice - roundedCurrentItemPrice
                const roundedNewPackPrice = Number(Number(pack.new_price).toFixed(1))
                const roundedCurrentPackPrice = Number(Number(pack.sales_price).toFixed(1))
                
                const multiplyOperation = increaseAmount * Number(pack.item_qty)
                const roundedMultiply = Number(multiplyOperation.toFixed(1))
                if(roundedNewPackPrice !== roundedCurrentPackPrice + roundedMultiply ){
                        item2FromPack["errorMessage"] = "Preço em não conformidade com pacote"
                }
            }
        }
    }

    if(itemHasPack){
        const packFromItem = returnArr.find((product)=> product.code == itemHasPack?.pack_id)

        if(itemHasPack && !packFromItem){
            itemHasPack["errorMessage"] = "Informar o pack também"
        }
    }

   

    return returnArr
}


export { validateCsvService }