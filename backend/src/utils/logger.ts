const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    try {
      input = JSON.stringify(input)
    } catch {
      input = '[Object]'
    }
  }
  
  try {
    return input
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/\\[rnt]/g, ' ')
      .replace(/[<>"'&]/g, '_')
      .replace(/javascript:/gi, 'js_')
      .replace(/vbscript:/gi, 'vb_')
      .substring(0, 1000)
  } catch {
    return '[SANITIZATION_ERROR]'
  }
}

export const safeLog = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${sanitizeForLog(message)}`, data ? sanitizeForLog(data) : '')
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${sanitizeForLog(message)}`, error ? sanitizeForLog(error) : '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${sanitizeForLog(message)}`, data ? sanitizeForLog(data) : '')
  }
}