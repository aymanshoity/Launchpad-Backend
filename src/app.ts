import express from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'
const app=express()
app.use(express.json())
app.use(cookieParser())



app.get('/health', async (_req, res) => {
   res.json({ message: "Success set up backend" }); 
});



app.use(routes)
app.use(errorHandler)

export default app;