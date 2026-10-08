
import app from './app'
import { env } from './config/env'
app.listen(env.PORT,(err)=>{
   if(err){
      console.error(err)
   process.exit(1)
   }
   console.log(`Server running on port ${env.PORT}`)
}

)