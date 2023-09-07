import { connectClient } from "../database/config"



async function readDataService(){
    const client = await connectClient()

    const [result ]:any = await client.query('SELECT * FROM products')
    return result

    // const salesPrice = 'SELECT sales_price FROM products WHERE code = ?'
    // const salesValues = ['18']

    
    // const salesCost = 'SELECT cost_price FROM products WHERE code = ?'



    
    // const [salesPriceResult]  = await client.execute(salesPrice, salesValues)
    // const [salesCostResult] = await client.execute(salesCost, salesValues)

    // if( Array.isArray(salesPriceResult) && salesPriceResult.length> 0 && 'sales_price' in salesPriceResult[0]
    //     &&  Array.isArray(salesCostResult) && salesCostResult.length > 0 && 'cost_price' in salesCostResult[0]
    // ){
    //    const preco = salesPriceResult[0].sales_price
    //    const custo = salesCostResult[0].cost_price
       
    //    console.log(preco, custo)
    // }
}

export { readDataService }