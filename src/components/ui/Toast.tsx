import type { ToastType } from '../../hooks/useToast'
import { clsx } from 'clsx'

interface Props {
  toasts: { id: number; message: string; type: ToastType }[]
}

export function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'animate-slide-up px-4 py-3 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2',
            t.type === 'success' && 'bg-rn-success text-white',
            t.type === 'error'   && 'bg-rn-danger text-white',
            t.type === 'info'    && 'bg-rn-accent text-white',
          )}
        >
          {t.type === 'success' && '✓'}
          {t.type === 'error'   && '✕'}
          {t.type === 'info'    && 'ℹ'}
          {t.message}
        </div>
      ))}
    </div>
  )
}
