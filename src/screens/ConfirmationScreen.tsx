import React from 'react'
import PrimaryButton from '../components/PrimaryButton'
import FormSection from '../components/FormSection'
import LoadingSpinner from '../components/LoadingSpinner'

interface AppData {
  personal: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
  }
  financial: {
    employmentStatus: string
    incomeRange: string
    monthlyExpenses: string
    currentSavings: string
  }
  goals: {
    mainGoal: string
    targetAmount: string
    timeframe: string
    riskPreference: string
  }
}

interface ConfirmationScreenProps {
  data: AppData
  onConfirm: () => void
  onBack: () => void
  submitting?: boolean
}

const formatCurrency = (value: string): string => {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return value
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

const formatLabel = (value: string): string => {
  const labels: Record<string, string> = {
    'full-time': 'Full-Time Employed',
    'part-time': 'Part-Time Employed',
    'self-employed': 'Self-Employed',
    'student': 'Student',
    'retired': 'Retired',
    'unemployed': 'Not Currently Employed',
    'under-30k': 'Under $30,000',
    '30k-50k': '$30,000 — $50,000',
    '50k-80k': '$50,000 — $80,000',
    '80k-120k': '$80,000 — $120,000',
    'over-120k': 'Over $120,000',
    'buy-home': 'Buy a Home',
    'retirement': 'Retirement Planning',
    'emergency-fund': 'Build Emergency Fund',
    'debt-reduction': 'Debt Reduction',
    'investment': 'Grow Investments',
    'education': 'Education Fund',
    'travel': 'Travel Fund',
    'other': 'Other',
    '1-2-years': '1 — 2 Years',
    '3-5-years': '3 — 5 Years',
    '5-10-years': '5 — 10 Years',
    '10-plus-years': '10+ Years',
    'conservative': 'Conservative',
    'moderate': 'Moderate',
    'aggressive': 'Aggressive',
  }
  return labels[value] || value
}

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
  </div>
)

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  data,
  onConfirm,
  onBack,
  submitting = false,
}) => {
  return (
    <div className="space-y-6">
      <FormSection
        title="Confirm Your Details"
        subtitle="Please review everything before submitting."
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="rounded-xl bg-gray-50/60 p-4">
          <h3 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">
            Personal Details
          </h3>
          <SummaryRow label="Full Name" value={data.personal.fullName} />
          <SummaryRow label="Email" value={data.personal.email} />
          <SummaryRow label="Phone" value={data.personal.phone} />
          <SummaryRow label="Date of Birth" value={data.personal.dateOfBirth} />
        </div>

        <div className="rounded-xl bg-gray-50/60 p-4">
          <h3 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">
            Financial Snapshot
          </h3>
          <SummaryRow label="Employment" value={formatLabel(data.financial.employmentStatus)} />
          <SummaryRow label="Income Range" value={formatLabel(data.financial.incomeRange)} />
          <SummaryRow label="Monthly Expenses" value={formatCurrency(data.financial.monthlyExpenses)} />
          <SummaryRow label="Current Savings" value={formatCurrency(data.financial.currentSavings)} />
        </div>

        <div className="rounded-xl bg-gray-50/60 p-4">
          <h3 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">
            Financial Goals
          </h3>
          <SummaryRow label="Main Goal" value={formatLabel(data.goals.mainGoal)} />
          <SummaryRow label="Target Amount" value={formatCurrency(data.goals.targetAmount)} />
          <SummaryRow label="Timeframe" value={formatLabel(data.goals.timeframe)} />
          <SummaryRow label="Risk Preference" value={formatLabel(data.goals.riskPreference)} />
        </div>
      </FormSection>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <PrimaryButton variant="secondary" onClick={onBack} disabled={submitting}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Edit Details
        </PrimaryButton>
        <PrimaryButton variant="primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving to Supabase...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm &amp; Submit
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  )
}

export default ConfirmationScreen
