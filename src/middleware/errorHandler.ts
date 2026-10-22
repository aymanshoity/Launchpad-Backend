import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client";
const { JsonWebTokenError } = jwt;

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof ZodError) {
    res.status(400).json({
      status:400,
      error: "Invalid input",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  } else if (err instanceof JsonWebTokenError) {
    // covers bad signature AND expired tokens
    res.status(401).json({ status:401,error: "Invalid or expired token" });
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    // unique constraint (email or username already exists)
    res.status(409).json({status:409, error: "Email or username is already in use" });
  } else {
    console.error(err);
    res.status(500).json({status:500, error: "Something went wrong" });
  }
};