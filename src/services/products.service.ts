
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { uploadImage } from "../utils/uploadImage";

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
         medial: true, topics: {
            include: { topic: true }
         }
      },
      orderBy: {
         createdAt: 'desc'
      }
   })
}
export const getProductForFounder = async (productId: string, founderId: string) => {

   const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { media: true, topics: { include: { topic: true } } }
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
         folder: `launchpad/products/${productId}/logo`,
         public_id: "logo",
         overWrite: true,
         invalidate: true,
         transformation: [{ width: 512, height: 512, crop: "fit" }]
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

export const addScreenshots = async (productId: string, founderId: string, files: Buffer[]) => {
   await getEditableOwnedProduct(productId, founderId);

   const existing = await prisma.productMedia.findMany({
      where: { productId, kind: "screenshot" },
      select: { position: true }
   });

   if (existing.length + files.length > MAX_SCREENSHOTS) {
      throw new AppError(400, `Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
   }

   const startPosition = existing.length ? Math.max(...existing.map((e) => e.position)) + 1 : 0;

   const uploaded = await Promise.all(
      files.map((buffer) =>
         uploadImage(buffer, {
            folder: `launchpad/products/${productId}/screenshots`,
            transformation: [{ width: 1200, crop: "limit" }]
         })
      )
   );

   return prisma.$transaction(
      uploaded.map((result, i) =>
         prisma.productMedia.create({
            data: {
               productId,
               kind: "screenshot",
               fileUrl: result.secure_url,
               position: startPosition + i
            }
         })
      )
   );
};
