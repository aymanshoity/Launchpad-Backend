import { Router } from "express";
import authRoutes from "./auth.routes.js";
import topicsRoutes from "./topics.routes.js";
import productsRoutes from "./product.routes.js";
import StaffRoutes from "./staff.routes.js"
import adminRoutes from "./admin.routes";
const router=Router()

router.use("/auth",authRoutes)
router.use("/topics",topicsRoutes)
router.use("/products",productsRoutes)
router.use("/staff",StaffRoutes)
router.use("/admin", adminRoutes);
export default router;