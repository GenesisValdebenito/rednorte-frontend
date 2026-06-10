import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error:   (msg: string) => addToast(msg, 'error'),
    info:    (msg: string) => addToast(msg, 'info'),
  }

  return { toasts, toast }
}
