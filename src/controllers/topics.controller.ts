import { RequestHandler } from "express"
import * as topicsService from "../services/topics.service"
import { z } from "zod";
const createTopicSchema = z.object({
  name: z.string().trim().min(2).max(40),
});
export const findListTopics:RequestHandler=async(_req,res)=>{
   const topics =await topicsService.listTopics();
   res.json({topics})
}

export const createTopic: RequestHandler = async (req, res) => {
  const { name } = createTopicSchema.parse(req.body);
  const topic = await topicsService.createTopic(res.locals.userId, name, req.ip);
  res.status(201).json({ topic });
};