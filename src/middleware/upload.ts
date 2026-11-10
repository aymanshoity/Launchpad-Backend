import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 8;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const upload = multer({
   storage: multer.memoryStorage(),
   limits: {
      fileSize: MAX_FILE_SIZE,
      files: MAX_FILES_PER_REQUEST,
   },
   fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
         return cb(new AppError(400, "Only JPEG, PNG or WebP images are allowed"));
      }
      cb(null, true);
   },
});
