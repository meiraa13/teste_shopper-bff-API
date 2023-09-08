import fs from "fs"
import csv from "csv-parser"

export interface IData{
    product_code:string,
    new_price:string,
    pack?:boolean,
    item_id?:number[],
    item_qty?:number,
    has_pack?:boolean,
    pack_id?:number
}

async function convertCsvFile(file:string):Promise<IData[]>{
    return new Promise((resolve, reject) => {
        const results:any = [];
    
        fs.createReadStream(file)
          .pipe(csv())
          .on("data", (data: any) => {
            results.push(data);
          })
          .on("end", () => {
            fs.unlink(file, (error) => {
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            });
          })
          .on("error", (error: any) => {
            reject(error);
          });
    
        return results;
      });


}

export { convertCsvFile }