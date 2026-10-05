import React, { useState } from 'react'
import PrimaryButton from '../components/PrimaryButton'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'

interface FinancialGoals {
  mainGoal: string
  targetAmount: string
  timeframe: string
  riskPreference: string
}

interface InformationScreen3Props {
  data: FinancialGoals
  onNext: (data: FinancialGoals) => void
  onBack: () => void
}

const InformationScreen3: React.FC<InformationScreen3Props> = ({
  data,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<FinancialGoals>(data)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FinancialGoals, string>>
  >({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FinancialGoals]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FinancialGoals, string>> = {}
    if (!formData.mainGoal)
      newErrors.mainGoal = 'Please select a main financial goal'
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required'
    }
    if (!formData.timeframe)
      newErrors.timeframe = 'Please select a timeframe'
    if (!formData.riskPreference)
      newErrors.riskPreference = 'Risk preference is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormSection
        title="Financial Goals"
        subtitle="What are you working towards? Let us know your targets."
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
      >
        <FormInput
          label="Main Financial Goal"
          name="mainGoal"
          value={formData.mainGoal}
          onChange={handleChange}
          placeholder="Select your primary goal"
          required
          error={errors.mainGoal}
          options={[
            { value: 'buy-home', label: 'Buy a Home' },
            { value: 'retirement', label: 'Retirement Planning' },
            { value: 'emergency-fund', label: 'Build Emergency Fund' },
            { value: 'debt-reduction', label: 'Debt Reduction' },
            { value: 'investment', label: 'Grow Investments' },
            { value: 'education', label: 'Education Fund' },
            { value: 'travel', label: 'Travel Fund' },
            { value: 'other', label: 'Other' },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Target Amount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="e.g. 100000"
            required
            error={errors.targetAmount}
          />

          <FormInput
            label="Timeframe"
            name="timeframe"
            value={formData.timeframe}
            onChange={handleChange}
            placeholder="Select your timeframe"
            required
            error={errors.timeframe}
            options={[
              { value: '1-2-years', label: '1 — 2 Years' },
              { value: '3-5-years', label: '3 — 5 Years' },
              { value: '5-10-years', label: '5 — 10 Years' },
              { value: '10-plus-years', label: '10+ Years' },
            ]}
          />
        </div>

        <FormInput
          label="Risk Preference"
          name="riskPreference"
          value={formData.riskPreference}
          onChange={handleChange}
          placeholder="Select your risk tolerance"
          required
          error={errors.riskPreference}
          options={[
            { value: 'conservative', label: 'Conservative — Low risk, stable returns' },
            { value: 'moderate', label: 'Moderate — Balanced risk and return' },
            { value: 'aggressive', label: 'Aggressive — Higher risk, higher potential return' },
          ]}
        />
      </FormSection>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <PrimaryButton variant="secondary" onClick={onBack}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </PrimaryButton>
        <PrimaryButton type="submit" variant="primary">
          Review Summary
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </PrimaryButton>
      </div>
    </form>
  )
}

export default InformationScreen3
