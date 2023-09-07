import { NextFunction, Request, Response } from "express";
import { AppError } from "../error";

async function verifyCSVMiddleware(req:Request, res:Response, next:NextFunction){

    if(!req.file){
        throw new AppError("Arquivo não encontrado", 404)
    }

    if(req.file.mimetype !== "text/csv"){
        throw new AppError("Tipo de arquivo não suportado", 400)
    }

    next()
}

export { verifyCSVMiddleware }