import { RequestHandler } from "express"
import * as topicsService from "../services/topics.service"


export const findListTopics:RequestHandler=async(_req,res)=>{
   const topics =await topicsService.listTopics();
   res.json({topics})
}