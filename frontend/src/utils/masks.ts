export const cpfMask = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  try {
    const sanitized = value.replace(/[^0-9]/g, '')
    return sanitized
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  } catch {
    return ''
  }
}

export const phoneMask = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  try {
    const sanitized = value.replace(/[^0-9]/g, '')
    return sanitized
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
  } catch {
    return ''
  }
}

export const removeCpfMask = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  try {
    return value.replace(/[^0-9]/g, '')
  } catch {
    return ''
  }
}

export const removePhoneMask = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  try {
    return value.replace(/[^0-9]/g, '')
  } catch {
    return ''
  }
}