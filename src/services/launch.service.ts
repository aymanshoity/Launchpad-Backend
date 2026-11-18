import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

const todayUtc=()=>{
   const d=new Date();
   return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))

}

export const scheduleLaunch=async(productId:string,founderId:string,launchDate:Date)=>{

   if(launchDate<=todayUtc()){
      throw new AppError(400,"Launch day must be a future day")
   }

   return prisma.$transaction(async(tx)=>{

      await tx.$queryRaw`SELECT id FROM users WHERE id=${founderId}::uuid FOR UPDATE`;

      const product=await tx.product.findUnique({where:{id:productId}});
      if(!product) throw new AppError(400,'Product not found')
      if(product.founderId !== founderId) throw new AppError(403,'Not your Product')
      if(product.status !== "approved" && product.status !== "scheduled" ) throw new AppError(400, "Only an approved product can be scheduled")

      const settings=await tx.appSetting.findUnique({
         where:{key:"max_launches_per_founder_per_day"}
      })

      const max=settings? parseInt(settings.value,10):2;

      const alreadyThatDay=await tx.product.count({
         where:{founderId,launchDate,status:{in:["scheduled","live"]},id:{not:productId}}
      })
      if(alreadyThatDay>=max){
         throw new AppError(409, `You can launch at most ${max} products on the same day`);
      }

      return tx.product.update({
         where:{id:productId},
         data:{status:"scheduled",launchDate}
      })

   })

   
}

export const goLive=async()=>{
const {count} =await prisma.product.updateMany({
   where:{status:"scheduled",launchDate:{lte:todayUtc()}},
   data:{status:"live",launchedAt:new Date()}
})
return count;
}