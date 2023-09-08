import { connectClient } from "../database/config"



async function readDataService():Promise<any>{
    const client = await connectClient()

    const [result ]:any = await client.query('SELECT * FROM packs where pack_id = 1010')
    return result

  
}

export { readDataService }