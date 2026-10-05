import React, { useState } from 'react'
import PrimaryButton from '../components/PrimaryButton'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'

interface FinancialSnapshot {
  employmentStatus: string
  incomeRange: string
  monthlyExpenses: string
  currentSavings: string
}

interface InformationScreen2Props {
  data: FinancialSnapshot
  onNext: (data: FinancialSnapshot) => void
  onBack: () => void
}

const InformationScreen2: React.FC<InformationScreen2Props> = ({
  data,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<FinancialSnapshot>(data)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FinancialSnapshot, string>>
  >({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FinancialSnapshot]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FinancialSnapshot, string>> = {}
    if (!formData.employmentStatus)
      newErrors.employmentStatus = 'Employment status is required'
    if (!formData.incomeRange)
      newErrors.incomeRange = 'Income range is required'
    if (!formData.monthlyExpenses) {
      newErrors.monthlyExpenses = 'Monthly expenses are required'
    }
    if (!formData.currentSavings) {
      newErrors.currentSavings = 'Current savings is required'
    }
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
        title="Financial Snapshot"
        subtitle="Help us understand your current financial position."
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
      >
        <FormInput
          label="Employment Status"
          name="employmentStatus"
          value={formData.employmentStatus}
          onChange={handleChange}
          placeholder="Select your employment status"
          required
          error={errors.employmentStatus}
          options={[
            { value: 'full-time', label: 'Full-Time Employed' },
            { value: 'part-time', label: 'Part-Time Employed' },
            { value: 'self-employed', label: 'Self-Employed' },
            { value: 'student', label: 'Student' },
            { value: 'retired', label: 'Retired' },
            { value: 'unemployed', label: 'Not Currently Employed' },
          ]}
        />

        <FormInput
          label="Annual Income Range"
          name="incomeRange"
          value={formData.incomeRange}
          onChange={handleChange}
          placeholder="Select your income range"
          required
          error={errors.incomeRange}
          options={[
            { value: 'under-30k', label: 'Under $30,000' },
            { value: '30k-50k', label: '$30,000 — $50,000' },
            { value: '50k-80k', label: '$50,000 — $80,000' },
            { value: '80k-120k', label: '$80,000 — $120,000' },
            { value: 'over-120k', label: 'Over $120,000' },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Monthly Expenses"
            name="monthlyExpenses"
            value={formData.monthlyExpenses}
            onChange={handleChange}
            placeholder="e.g. 3500"
            required
            error={errors.monthlyExpenses}
          />

          <FormInput
            label="Current Savings"
            name="currentSavings"
            value={formData.currentSavings}
            onChange={handleChange}
            placeholder="e.g. 25000"
            required
            error={errors.currentSavings}
          />
        </div>
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
          Continue
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

export default InformationScreen2
