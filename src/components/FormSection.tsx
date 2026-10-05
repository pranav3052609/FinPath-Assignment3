import React from 'react'

interface FormSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  return (
    <section
      className={`rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-gray-200/40 p-6 sm:p-8 ${className}`}
      aria-labelledby={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {icon && (
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700">
              {icon}
            </span>
          )}
          <h2
            id={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-lg sm:text-xl font-bold text-gray-900 font-display"
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-2 ml-[52px]">{subtitle}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export default FormSection
