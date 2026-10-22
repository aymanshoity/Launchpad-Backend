import "dotenv/config"

import { z } from "zod"

const schema = z.object({
   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
   PORT: z.coerce.number().default(3001),
   DATABASE_URL: z.string().min(1),
   JWT_ACCESS_SECRET: z.string().min(32),
   JWT_REFRESH_SECRET: z.string().min(32),
   APP_URL: z.string().default("http://localhost:3001"),
   FRONTEND_URL: z.string().min(1),
   GOOGLE_CLIENT_ID: z.string().optional(),
   GMAIL_USER: z.string().email(),
   GMAIL_APP_PASSWORD: z.string().min(1),
})

export const env = schema.parse(process.env)