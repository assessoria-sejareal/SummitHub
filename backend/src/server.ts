import express from 'express'
// import cors from 'cors'
import { env } from './config/env'
import { sanitizeMiddleware } from './middlewares/sanitize'
import { reminderService } from './services/reminderService'
import { safeLog } from './utils/logger'
import authRoutes from './routes/auth'
import bookingRoutes from './routes/bookings'
import adminRoutes from './routes/admin'
import stationRoutes from './routes/stations'

const app = express()

// CORS with specific origins - validate URL
const allowedOrigins = [
  'http://localhost:3065',
  'https://summithub.railway.app',
  'https://zonal-manifestation-production.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean)

safeLog.info('Allowed CORS origins:', allowedOrigins)

// Manual CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin
  res.header('Access-Control-Allow-Origin', origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-CSRF-Token')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(express.json())
app.use(sanitizeMiddleware)

app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stations', stationRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

const server = app.listen(env.PORT, () => {
  safeLog.info(`Servidor iniciado na porta ${env.PORT}`)
  
  // Iniciar serviço de lembretes
  reminderService.startReminderScheduler()
})

server.on('error', (err: any) => {
  safeLog.error('Erro ao iniciar servidor', err.message)
  if (err.code === 'EADDRINUSE') {
    safeLog.error(`Porta ${env.PORT} já está em uso`)
  }
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  safeLog.info('SIGTERM received, shutting down gracefully')
  reminderService.stopReminderScheduler()
  server.close(() => {
    safeLog.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  safeLog.info('SIGINT received, shutting down gracefully')
  reminderService.stopReminderScheduler()
  server.close(() => {
    safeLog.info('Process terminated')
    process.exit(0)
  })
})