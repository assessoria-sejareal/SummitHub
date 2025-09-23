export const sanitizeText = (text: string | number): string => {
  if (typeof text === 'number') return text.toString()
  if (!text || typeof text !== 'string') return ''
  
  try {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  } catch {
    return ''
  }
}

export const sanitizeForNotification = (text: string | number): string => {
  if (typeof text === 'number') return text.toString()
  if (!text || typeof text !== 'string') return ''
  
  try {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .substring(0, 100)
  } catch {
    return ''
  }
}