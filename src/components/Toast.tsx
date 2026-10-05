import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgStyles = {
    success: 'bg-gradient-to-r from-secondary-500 to-secondary-600 shadow-secondary-500/30',
    error: 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30',
    info: 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-500/30',
  }

  const icons = {
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  }

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm font-medium shadow-xl ${bgStyles[type]}`}
        role="alert"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[type]}
        </svg>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toast