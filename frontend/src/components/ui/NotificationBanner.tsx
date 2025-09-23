import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from './Button'

interface NotificationBannerProps {
  isSupported: boolean
  permission: NotificationPermission
  onRequestPermission: () => Promise<boolean>
}

export const NotificationBanner = ({ 
  isSupported, 
  permission, 
  onRequestPermission 
}: NotificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isSupported || permission === 'granted' || !isVisible) {
    return null
  }

  const handleRequest = async () => {
    const granted = await onRequestPermission()
    if (granted) {
      setIsVisible(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Ativar Notificações
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Receba lembretes sobre suas reservas e atualizações importantes.
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                variant="primary"
                onClick={handleRequest}
                className="text-xs px-3 py-1"
              >
                Ativar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsVisible(false)}
                className="text-xs px-3 py-1"
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-400 hover:text-blue-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}