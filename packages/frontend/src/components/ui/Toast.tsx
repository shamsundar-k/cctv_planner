/*
 * FILE SUMMARY — src/components/ui/Toast.tsx
 *
 * Context-based toast notification system. Provides a global mechanism for
 * displaying short-lived, dismissable alerts anywhere in the component tree.
 *
 * ToastProvider({ children }) — Context provider that wraps the application
 *   (mounted in App.tsx). Maintains the list of active toasts in local state.
 *   Each toast auto-dismisses after 3500 ms. Renders a <ToastContainer> fixed
 *   to the bottom-right of the screen.
 *
 * useToast() — Custom hook that returns the `showToast` function from context.
 *   Components call showToast(message, type?) to queue a new notification.
 *   Throws if used outside a <ToastProvider>.
 *
 * showToast(message, type?) — Callable returned by useToast(). Accepts a
 *   message string and an optional ToastType ('success' | 'error' | 'info',
 *   defaults to 'info'). Adds a new ToastItem to the queue with a unique id.
 *
 * ToastContainer({ toasts, onDismiss }) — Internal component. Renders the
 *   fixed overlay container. Returns null when the queue is empty; otherwise
 *   renders a column of <ToastMessage> elements.
 *
 * ToastMessage({ toast, onDismiss }) — Internal component. Renders a single
 *   toast with a coloured icon, message text, and a dismiss button. Uses a
 *   requestAnimationFrame-triggered CSS slide-in transition on mount.
 *   Calls onDismiss(id) when the dismiss button is clicked.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

// ── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx.showToast
}

// ── Container + Individual Toast ─────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: {
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '✓',
    iconColor: '#16a34a',
  },
  error: {
    bg: '#fef2f2',
    border: '#fca5a5',
    icon: '✕',
    iconColor: '#dc2626',
  },
  info: {
    bg: '#eff6ff',
    border: '#93c5fd',
    icon: 'ℹ',
    iconColor: '#2563eb',
  },
}

function ToastMessage({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: number) => void
}) {
  const [visible, setVisible] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      // Trigger slide-in on next frame
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  const s = TYPE_STYLES[toast.type]

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        minWidth: 280,
        maxWidth: 400,
        pointerEvents: 'auto',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: s.iconColor,
          flexShrink: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: s.iconColor + '20',
          borderRadius: '50%',
        }}
      >
        {s.icon}
      </span>

      {/* Message */}
      <span style={{ fontSize: 14, color: '#1a1a1a', flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          fontSize: 14,
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#1a1a1a')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#999')}
      >
        ✕
      </button>
    </div>
  )
}
