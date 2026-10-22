import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'
import { env } from './config/env'
const app=express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
   origin:env.FRONTEND_URL,
   credentials:true
}))

app.get('/health', async (_req, res) => {
   res.json({ message: "Success set up backend" }); 
});



app.use(routes)
app.use(errorHandler)

export default app;