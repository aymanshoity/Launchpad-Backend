import "dotenv/config"

import { z } from "zod"

const schema = z.object({
   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
   PORT: z.coerce.number().default(3001),
   DATABASE_URL: z.string().min(1),
   JWT_ACCESS_SECRET: z.string().min(32),
   JWT_REFRESH_SECRET: z.string().min(32),
   APP_URL: z.string().default("http://localhost:3001"),
   RESEND_API_KEY: z.string().min(1),
   EMAIL_FROM: z.string().min(1),
})

export const env = schema.parse(process.env)