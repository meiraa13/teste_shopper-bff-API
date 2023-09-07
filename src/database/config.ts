import "dotenv/config";
import mysql from "mysql2/promise";

async function connectClient():Promise<mysql.Connection>{
    const client:mysql.Connection = await mysql.createConnection(process.env.DATABASE_URL!);
    return client
}


async function startDatabase():Promise<void>{
    const client:mysql.Connection = await connectClient()
    await client.connect()
    console.log('Database started')
}


export { connectClient, startDatabase  };