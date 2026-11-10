import { Router } from "express";
import * as products from "../controllers/products.controller";
import { requiredAuth } from "../middleware/requireAuth";
import { upload  } from "../middleware/upload";

const router = Router();

router.post("/", requiredAuth,products.createDraft);
router.get("/", requiredAuth,products.getMyProducts);
router.get("/:productId", requiredAuth,products.getProductForFounder);
router.patch("/:productId/update", requiredAuth,products.updateDraft);
router.post("/:productId/submit", requiredAuth,products.submitForReview);
router.post("/:productId/screenshots", requiredAuth, upload.array("screenshot", 8), products.addScreenshots);
router.post("/:productId/logo", requiredAuth,upload.single("logo"), products.uploadLogo);

export default router;