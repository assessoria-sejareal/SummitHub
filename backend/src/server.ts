import express from 'express'
import cors from 'cors'
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
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

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