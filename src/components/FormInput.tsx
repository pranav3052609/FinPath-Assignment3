import React from 'react'

interface FormInputProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  options?: { value: string; label: string }[]
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
}) => {
  const inputId = `input-${name}`
  const errorId = `error-${name}`

  const baseInputStyles =
    'w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'

  const errorInputStyles = error
    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
    : 'border-gray-200 hover:border-gray-300'

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {options ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputStyles} ${errorInputStyles} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`}
        >
          <option value="">{placeholder || 'Select an option...'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputStyles} ${errorInputStyles}`}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormInput
