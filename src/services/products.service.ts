
import { cloudinary } from "../lib/cloudinary";
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { uploadImage, UploadedImage } from "../utils/uploadImage";



const MAX_TOPICS = 3;
const MAX_SCREENSHOTS = 8;
type DraftUpdate = {
   name?: string;
   pitch?: string;
   description?: string;
   websiteUrl?: string;
   topicIds?: string[];
};
function slugify(name: string) {
   return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
}
export const createDraft = async (founderId: string, input: { name: string }) => {

   const baseSlug = slugify(input.name)
   let slug = baseSlug;
   let suffix = 0;
   while (await prisma.product.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
   }

   const product = await prisma.product.create({
      data: {
         founderId,
         name: input.name,
         slug,
         pitch: "",
         description: "",
         websiteUrl: "",
         status: "draft",
      },
   })
   return product;
}
export const updateDraft = async (productId: string, founderId: string, updates: DraftUpdate) => {
   const product = await prisma.product.findUnique({ where: { id: productId } })
   if (!product) throw new AppError(404, "Product not found")
   if (product.founderId !== founderId) throw new AppError(403, "Not your product")

   if (product.status !== "draft" && product.status !== "changes_requested") {
      throw new AppError(400, "This product can no longer be edited this way")
   }
   if (updates.topicIds && updates.topicIds.length > MAX_TOPICS) {
      throw new AppError(400, `Maximum ${MAX_TOPICS} topics allowed`)
   }

   const { topicIds, ...fields } = updates;

   const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.product.update({
         where: { id: productId },
         data: fields
      })
      if (topicIds) {
         await tx.productTopic.deleteMany({ where: { productId } });
         await tx.productTopic.createMany({
            data: topicIds.map(topicId => ({ productId, topicId }))
         });
      }
      return result;
   })

   return updated;

}
export const submitForReview = async (productId: string, founderId: string) => {

   const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { media: true, topics: true }

   })

   if (!product) throw new AppError(404, "Product not found")
   if (product.founderId !== founderId) throw new AppError(403, "Not your product")

   if (product.status !== "draft" && product.status !== "changes_requested") {
      throw new AppError(400, "This product can no longer be edited this way")
   }
   if (!product.pitch || !product.description || !product.websiteUrl) {
      throw new AppError(400, "Pitch, description, and website link are required")
   }

   const hasLogo = product.media.some((m) => m.kind === "logo")
   if (!hasLogo) {
      throw new AppError(400, "A logo is required before submitting")
   }
   if (product.topics.length === 0) {
      throw new AppError(400, "At least one topic is required")
   }

   return prisma.product.update({
      where: { id: productId },
      data: { status: "in_review", submittedAt: new Date() }
   })

}
export const getMyProducts = async (founderId: string) => {

   return prisma.product.findMany({
      where: { founderId },
      include: {
         media: true, topics: {
            include: { topic: true }
         },
         reviews: {
            orderBy: { createdAt: "desc" },
            select: { decision: true, note: true, createdAt: true }, // no reviewer identity
         },
      },
      orderBy: {
         createdAt: 'desc'
      }
   })
}
export const getProductForFounder = async (productId: string, founderId: string) => {

   const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
         media: true,
         topics: { include: { topic: true } },
         reviews: {
            orderBy: { createdAt: "desc" },
            select: { decision: true, note: true, createdAt: true }, // no reviewer identity
         },
      },

   })

   if (!product) throw new AppError(404, "Product not found")
   if (product.founderId !== founderId) throw new AppError(403, "Not your product")
   return product;
}

const getEditableOwnedProduct = async (productId: string, founderId: string) => {
   const product = await prisma.product.findUnique({ where: { id: productId } })
   if (!product) throw new AppError(404, "Product not found");
   if (product.founderId !== founderId) throw new AppError(403, "Not your product");
   if (product.status !== "draft" && product.status !== "changes_requested") {
      throw new AppError(400, "Images can no longer be changed for this product");
   }
   return product;
}


export const setLogo = async (productId: string, founderId: string, file: Buffer) => {
   await getEditableOwnedProduct(productId, founderId);

   const result = await uploadImage(file,
      {
         folder: `launchpad/products/${productId}`,
         public_id: "logo",
         overWrite: true,
         invalidate: true,
         transformation: [{ width: 512, height: 512, crop: "limit" }]
      }
   )

   const [, logo] = await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId, kind: "logo" } }),
      prisma.productMedia.create({
         data: {
            productId,
            kind: "logo",
            fileUrl: result.secure_url,
            position: 0
         }
      })

   ])
   return logo;

}

const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId, { invalidate: true })

export const addScreenshots = async (productId: string, founderId: string, files: Buffer[]) => {
   await getEditableOwnedProduct(productId, founderId);

   if (files.length === 0) throw new AppError(400, "No images uploaded")

   const existingCount = await prisma.productMedia.count({
      where: { productId, kind: "screenshot" },
   });

   if (existingCount + files.length > MAX_SCREENSHOTS) {
      throw new AppError(400, `Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
   }

   // const startPosition = existingCount ? Math.max(...existing.map((e) => e.position)) + 1 : 0;

   const uploaded: UploadedImage[] = [];
   try {
      for (const buffer of files) {
         uploaded.push(await uploadImage(buffer, {
            folder: `launchpad/products/${productId}/screenshots`,
            transformation: [{ width: 1200, crop: "limit" }]
         }))
      }



      return await prisma.$transaction(async (tx) => {
         await tx.$queryRaw`SELECT id FROM products WHERE id=${productId}::uuid FOR UPDATE`
         const existing = await tx.productMedia.findMany({
            where: { productId, kind: "screenshot" },
            select: { position: true }
         })

         if (existing.length + uploaded.length > MAX_SCREENSHOTS) {
            throw new AppError(400, `Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
         }
         const startPosition = existing.length ? Math.max(...existing.map((e) => e.position)) + 1 : 0;

         return Promise.all(uploaded.map((u, index) => tx.productMedia.create({
            data: {
               productId,
               kind: "screenshot",
               fileUrl: u.secure_url,
               position: startPosition + index
            }
         })))
      }

      );
   } catch (error) {
      await Promise.allSettled(uploaded.map((u) => deleteImage(u.public_id)));
      throw error;
   }
}
