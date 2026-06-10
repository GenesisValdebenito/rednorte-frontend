import { clsx } from 'clsx'
import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'

// ── Button ────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type BtnSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-sm',
        variant === 'primary'   && 'bg-rn-accent hover:bg-rn-accent-hover text-white focus:ring-rn-accent',
        variant === 'secondary' && 'bg-white hover:bg-rn-50 text-rn-700 border border-rn-200 focus:ring-rn-accent',
        variant === 'danger'    && 'bg-rn-danger hover:bg-red-600 text-white focus:ring-red-500',
        variant === 'success'   && 'bg-rn-success hover:bg-emerald-600 text-white focus:ring-emerald-500',
        variant === 'ghost'     && 'bg-transparent hover:bg-rn-100 text-rn-500 hover:text-rn-700 border border-rn-200',
        (rest.disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'cyan'

interface BadgeProps { children: ReactNode; color?: BadgeColor; className?: string }

export function Badge({ children, color = 'blue', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full',
      color === 'blue'   && 'bg-blue-50 text-blue-700',
      color === 'green'  && 'bg-emerald-50 text-emerald-700',
      color === 'yellow' && 'bg-amber-50 text-amber-700',
      color === 'red'    && 'bg-red-50 text-red-700',
      color === 'purple' && 'bg-purple-50 text-purple-700',
      color === 'gray'   && 'bg-slate-100 text-slate-600',
      color === 'cyan'   && 'bg-cyan-50 text-cyan-700',
      className
    )}>
      {children}
    </span>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-semibold text-rn-600 uppercase tracking-wider">{label}</label>}
      <input
        {...rest}
        className={clsx(
          'bg-white border rounded-lg px-3 py-2 text-sm text-rn-800 placeholder-rn-400 outline-none transition-colors',
          error ? 'border-red-500 focus:border-red-400' : 'border-rn-300 focus:border-rn-accent',
          className
        )}
      />
      {error && <span className="text-[11px] text-rn-danger">{error}</span>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export function Select({ label, children, className, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-semibold text-rn-600 uppercase tracking-wider">{label}</label>}
      <select
        {...rest}
        className={clsx(
          'bg-white border border-rn-300 rounded-lg px-3 py-2 text-sm text-rn-800 outline-none focus:border-rn-accent transition-colors',
          className
        )}
      >
        {children}
      </select>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={clsx(
      'border-2 border-current border-t-transparent rounded-full animate-spin',
      size === 'sm' && 'w-3 h-3',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-8 h-8',
    )} />
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: ReactNode }

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-rn-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-rn-200 rounded-2xl shadow-lg animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-rn-200">
          <h3 className="text-base font-semibold text-rn-800">{title}</h3>
          <button onClick={onClose} className="text-rn-400 hover:text-rn-600 text-xl leading-none transition-colors">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white border border-rn-200 rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-rn-500 font-semibold">{title}</p>
      {description && <p className="text-sm text-rn-400 max-w-xs">{description}</p>}
    </div>
  )
}
