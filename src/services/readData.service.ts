import { connectClient } from "../database/config"



async function readDataService():Promise<any>{
    const client = await connectClient()

    const [result ]:any = await client.query('SELECT * FROM products ')
    return result

  
}

export { readDataService }