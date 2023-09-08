import { Router } from "express";
import { readDataController, updateProductController, validateCsvController } from "../controllers/data.controllers";
import multer from "multer";
import { verifyCSVMiddleware } from "../middlewares/verifyCSV.middleware";
import {resolve} from "node:path"


const location = resolve(__dirname,'..','..','tmp')
const storage = multer.diskStorage({
    destination: location,
})
const upload = multer({
    storage,
})


const productRoutes:Router = Router()

productRoutes.get('', readDataController )

productRoutes.post('', upload.single("file"), verifyCSVMiddleware, validateCsvController)
productRoutes.patch('', upload.single("file"), updateProductController)

export default productRoutes