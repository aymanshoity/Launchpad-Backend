import { Router } from "express";
import authRoutes from "./auth.routes.js";
import topicsRoutes from "./topics.routes.js";
import productsRoutes from "./product.routes.js";

const router=Router()

router.use("/auth",authRoutes)
router.use("/topics",topicsRoutes)
router.use("/products",productsRoutes)
export default router;