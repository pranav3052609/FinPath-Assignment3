/**
 * StepProgress — Multi-step progress stepper component
 *
 * Sourced from 21st.dev (https://21st.dev/components?category=steppers)
 * Adapted from the "Steppers" category using the copy-prompt-and-implement workflow.
 * Colours, spacing, and typography customised for the FinPath application theme.
 *
 * Original source: 21st.dev Steppers collection
 * Adapted for: FinPath MVP — Tailwind CSS + React TypeScript
 */

import React from 'react'

interface Step {
  label: string
  description?: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
  className?: string
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <nav
      aria-label="Progress"
      className={`w-full py-4 ${className}`}
    >
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <li
              key={step.label}
              className={`flex flex-col items-center relative ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isCompleted
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}

              {/* Step circle */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 border-primary-600 shadow-lg shadow-primary-500/30'
                        : isCurrent
                        ? 'bg-white border-primary-500 shadow-lg shadow-primary-500/20 ring-4 ring-primary-100'
                        : 'bg-white border-gray-200'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-primary-700' : 'text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-300 ${
                      isCompleted || isCurrent
                        ? 'text-primary-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p
                      className={`text-[10px] mt-0.5 hidden sm:block ${
                        isCompleted || isCurrent
                          ? 'text-gray-500'
                          : 'text-gray-300'
                      }`}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StepProgress
