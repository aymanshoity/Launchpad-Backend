import { UploadApiOptions } from "cloudinary";
import { cloudinary } from "../lib/cloudinary";

export const uploadImage = (buffer: Buffer, options: UploadApiOptions) => {
   return new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
         if (error || !result) {
            reject(error)
         } else {
            stream.end(buffer)
            resolve({ secure_url: result.secure_url })
         }
      })
   })
}