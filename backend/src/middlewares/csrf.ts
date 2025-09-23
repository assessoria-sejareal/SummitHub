import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

interface CSRFRequest extends Request {
  csrfToken?: string
}

const tokens = new Map<string, number>()

// Cleanup expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, timestamp] of tokens.entries()) {
    if (now - timestamp > 3600000) { // 1 hour
      tokens.delete(token)
    }
  }
}, 300000)

export const generateCSRFToken = (): string => {
  const token = crypto.randomBytes(32).toString('hex')
  tokens.set(token, Date.now())
  return token
}

export const csrfProtection = (req: CSRFRequest, res: Response, next: NextFunction) => {
  // Apply CSRF to all state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next()
  }

  const token = req.headers['x-csrf-token'] as string
  
  if (!token || !tokens.has(token)) {
    return res.status(403).json({ message: 'CSRF token inválido' })
  }

  // Remove token after use (single use)
  tokens.delete(token)
  next()
}

export const csrfTokenEndpoint = (req: Request, res: Response) => {
  const token = generateCSRFToken()
  res.json({ csrfToken: token })
}