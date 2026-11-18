import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { slugify } from "../utils/slugify"


export const listTopics = () => {
   return prisma.topic.findMany({ orderBy: { name: "asc" } })
}
export const createTopic = async (actorId: string, name: string, ip?: string) => {
   const slug = slugify(name)
   if (!slug) throw new AppError(400, "Topic name must contain letters or numbers");
   return prisma.$transaction(async (tx) => {
      const clash = await tx.topic.findFirst({
         where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] }
      })
      if (clash) throw new AppError(409, "A topic with this name already exists");
      const topic = await tx.topic.create({ data: { name, slug } })

      await tx.staffAuditLog.create({
         data: {
            actorId,
            action: "create_topic",
            targetType: "topic",
            targetId: topic.id,
            metadata: { name, slug },
            ipAddress: ip
         }
      })

      return topic;
   })

}

