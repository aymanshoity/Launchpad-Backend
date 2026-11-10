import { UploadApiOptions } from "cloudinary";
import { cloudinary } from "../lib/cloudinary";
import { AppError } from "./AppError";


export type UploadedImage = {
   secure_url: string;
   public_id: string;
};
export const uploadImage = (buffer: Buffer, options: UploadApiOptions) => {
   return new Promise<UploadedImage>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
         { timeout: 120000, ...options },
         (error, result) => {
            if (error || !result) {
               console.error("Cloudinary upload error:", error);
               const code = (error as { http_code?: number } | undefined)?.http_code;
               if (code === 499) {
                  return reject(new AppError(504, "Image upload timed out, please try again"));
               }
               return reject(new AppError(502, "Image upload failed"));
            }
            resolve({ secure_url: result.secure_url ,public_id: result.public_id });
         }
      );

      stream.end(buffer);
   });
};
