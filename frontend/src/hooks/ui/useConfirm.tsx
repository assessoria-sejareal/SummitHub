import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: ''
  })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    setOptions(options)
    setIsOpen(true)
    
    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }

  const handleConfirm = () => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
  }

  return {
    confirm,
    isOpen,
    options,
    handleConfirm,
    handleCancel
  }
}