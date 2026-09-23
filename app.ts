import express from 'express'
import { prisma } from './lib/prisma'
const port=3001
const app=express()
app.use(express.json())


app.get('/users',async(req,res)=>{
const users=await prisma.user.findMany()
return res.status(200).json({users})
})

app.listen(port,(err)=>{
   if(err){
      console.error(err)
   process.exit(1)
   }
   console.log(`Server running on port ${port}`)
}

)