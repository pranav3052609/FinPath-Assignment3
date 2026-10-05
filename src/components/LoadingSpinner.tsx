import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }}
      />
      {message && (
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner