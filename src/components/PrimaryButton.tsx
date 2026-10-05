import React from 'react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed'

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 focus:ring-primary-500 disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none disabled:translate-y-0',
    secondary:
      'bg-white text-primary-700 border-2 border-primary-200 shadow-sm hover:bg-primary-50 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none disabled:translate-y-0',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
