import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window as any)

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  // Remove HTML tags and scripts
  const cleaned = purify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
  
  // Remove control characters and normalize
  return cleaned.replace(/[\x00-\x1F\x7F]/g, '').trim()
}

export const sanitizeObject = (obj: any, visited = new WeakSet()): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    if (visited.has(obj)) return '[Circular]'
    visited.add(obj)
    return obj.map(item => sanitizeObject(item, visited))
  }
  
  if (obj && typeof obj === 'object') {
    if (visited.has(obj)) return '[Circular]'
    visited.add(obj)
    
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value, visited)
    }
    return sanitized
  }
  
  return obj
}