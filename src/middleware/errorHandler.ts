import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

import { Prisma } from "../../generated/prisma/client";

const { JsonWebTokenError, TokenExpiredError } = jwt;
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
   if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
   } else if (err instanceof ZodError) {
      res.status(400).json({
         error: "Invalid Input",
         details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      })
   } else if (err instanceof JsonWebTokenError) {
      res.status(401).json({ error: "invalid or expired token" })
   } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "Email already exists" })
   } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" })
   }
}