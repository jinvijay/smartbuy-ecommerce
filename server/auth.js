import { betterAuth } from 'better-auth'
import 'dotenv/config'
import { pool } from './db.js'

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 3001}`,
  trustedOrigins:
    process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
  },
})
