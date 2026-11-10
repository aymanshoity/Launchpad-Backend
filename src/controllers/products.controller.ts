import { RequestHandler } from "express"
import z from "zod"
import * as productService from "../services/products.service"
import { AppError } from "../utils/AppError"



const createSchema = z.object({
   name: z.string().trim().min(1).max(60)
})
const updateSchema = z.object({
   name: z.string().trim().min(1).max(60).optional(),
   pitch: z.string().trim().min(1).max(140).optional(),
   description: z.string().trim().min(1).optional(),
   websiteUrl: z.string().trim().min(1).url().optional(),
   topicIds: z.array(z.string().uuid()).max(3).optional(),
})
const paramsSchema = z.object({ productId: z.string().uuid() });

export const createDraft: RequestHandler = async (req, res) => {

   const body = createSchema.parse(req.body)
   const product = await productService.createDraft(res.locals.userId, body)
   res.status(201).json({ product, message: "Draft created successfully", status: 201 })

}
export const updateDraft: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   const body = updateSchema.parse(req.body)
   const product = await productService.updateDraft(productId, res.locals.userId, body)
   res.status(200).json({ product, message: "Draft updated successfully", status: 200 })
}
export const submitForReview: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   const product = await productService.submitForReview(productId, res.locals.userId)
   res.status(200).json({ product, message: "Product submitted for review successfully", status: 200 })
}
export const getMyProducts: RequestHandler = async (req, res) => {
   const products = await productService.getMyProducts(res.locals.userId)
   res.status(200).json({ products, status: 200 })
}
export const getProductForFounder: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   const products = await productService.getProductForFounder(productId, res.locals.userId)
   res.status(200).json({ products, status: 200 })
}
export const uploadLogo: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   if (!req.file) throw new AppError(400, "No file uploaded")
   const logo = await productService.setLogo(productId, res.locals.userId, req.file.buffer)
   res.status(200).json({ logo, status: 200 })
}
export const addScreenshots: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   
   const files=req.files as Express.Multer.File[] |undefined ??[]
   if(!files || files.length===0) throw new AppError(400, "No images uploaded")
   const screenshots = await productService.addScreenshots(productId, res.locals.userId, files.map((f) => f.buffer))
   res.status(200).json({ screenshots, status: 200 })
}
  


