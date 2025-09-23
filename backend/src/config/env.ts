import dotenv from 'dotenv'

dotenv.config()

const validateEnv = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateEnv()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  PORT: process.env.PORT || 3001
}