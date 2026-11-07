import { prisma } from "../lib/prisma"


export const listTopics=()=>{
   return prisma.topic.findMany({orderBy:{name:"asc"}})
}