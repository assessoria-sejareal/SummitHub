import { useState, useEffect, useCallback } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error)
      return false
    }
  }, [isSupported])

  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported) {
      console.warn('Notificações não suportadas')
      return null
    }

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/src/assets/images/logo.svg',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false
      })

      return notification
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error)
      return null
    }
  }, [isSupported, permission, requestPermission])

  const scheduleNotification = useCallback((options: NotificationOptions, delay: number) => {
    return setTimeout(() => {
      showNotification(options)
    }, delay)
  }, [showNotification])

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification
  }
}