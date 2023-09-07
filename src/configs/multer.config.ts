import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import {resolve } from 'node:path'

const tmpfolder = resolve(__dirname, "..", "..", "tmp")

export default {
    tmpfolder,
    fileFilter: (request: Request, file: Express.Multer.File, cb:FileFilterCallback) =>{
        const acceptedTypes = file.mimetype
        if(acceptedTypes == "text/csv"){
            cb(null, true)
        } else {
            cb(null, false)
            cb(new Error('Only csv format allowed'))
        }
    },
    storage: multer.diskStorage({
        destination:tmpfolder,
        filename: (request, file, cb) =>{
            const filename = file.originalname
            return cb(null, filename)
        }
    })
}