import { useState, useEffect, useCallback } from 'react'
import StepProgress from './components/StepProgress'
import LoginScreen from './screens/LoginScreen'
import InformationScreen1 from './screens/InformationScreen1'
import InformationScreen2 from './screens/InformationScreen2'
import InformationScreen3 from './screens/InformationScreen3'
import ConfirmationScreen from './screens/ConfirmationScreen'
import PrimaryButton from './components/PrimaryButton'
import Toast from './components/Toast'
import { supabase } from './lib/supabase'
import { apiSubmitPlan } from './lib/api'

interface FormData {
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

const INITIAL_DATA: FormData = {
  personal: { fullName: '', email: '', phone: '', dateOfBirth: '' },
  financial: { employmentStatus: '', incomeRange: '', monthlyExpenses: '', currentSavings: '' },
  goals: { mainGoal: '', targetAmount: '', timeframe: '', riskPreference: '' },
}

const STEPS = [
  { label: 'Personal', description: 'Your details' },
  { label: 'Financial', description: 'Income & expenses' },
  { label: 'Goals', description: 'Your targets' },
  { label: 'Confirm', description: 'Review & submit' },
]

type ToastState = { message: string; type: 'success' | 'error' | 'info' } | null

function App() {
  const [currentScreen, setCurrentScreen] = useState<number>(-1)
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA)
  const [submitted, setSubmitted] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token)
        setCurrentScreen(0)
      }
    })
  }, [])

  const isLoggedIn = currentScreen >= 0

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
  }, [])

  const handleLogin = useCallback((token: string) => {
    setAccessToken(token)
    setCurrentScreen(0)
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setAccessToken(null)
    setCurrentScreen(-1)
    setFormData(INITIAL_DATA)
  }, [])

  const handleConfirm = useCallback(async () => {
    setSubmitting(true)
    try {
      await apiSubmitPlan(formData)
      setSubmitted(true)
      showToast('Financial plan saved to Supabase!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save. Please try again.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }, [formData, showToast])

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 shadow-xl shadow-secondary-500/30 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
            Thank You, {formData.personal.fullName.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your financial profile has been saved to Supabase. A FinPath advisor will be in touch shortly.
          </p>
          <PrimaryButton
            variant="primary"
            onClick={() => {
              setSubmitted(false)
              setFormData(INITIAL_DATA)
              handleSignOut()
            }}
          >
            Start Over
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {isLoggedIn && (
        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900 font-display">FinPath</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
            <div className="pb-3">
              <StepProgress steps={STEPS} currentStep={currentScreen} />
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!isLoggedIn && <LoginScreen onLogin={handleLogin} />}
        {currentScreen === 0 && (
          <InformationScreen1
            data={formData.personal}
            onNext={(data) => { setFormData((p) => ({ ...p, personal: data })); setCurrentScreen(1) }}
            onBack={() => setCurrentScreen(-1)}
          />
        )}
        {currentScreen === 1 && (
          <InformationScreen2
            data={formData.financial}
            onNext={(data) => { setFormData((p) => ({ ...p, financial: data })); setCurrentScreen(2) }}
            onBack={() => setCurrentScreen(0)}
          />
        )}
        {currentScreen === 2 && (
          <InformationScreen3
            data={formData.goals}
            onNext={(data) => { setFormData((p) => ({ ...p, goals: data })); setCurrentScreen(3) }}
            onBack={() => setCurrentScreen(1)}
          />
        )}
        {currentScreen === 3 && (
          <ConfirmationScreen
            data={formData}
            onConfirm={handleConfirm}
            onBack={() => setCurrentScreen(2)}
            submitting={submitting}
          />
        )}
      </main>

      {isLoggedIn && (
        <footer className="text-center py-4 text-xs text-gray-400">
          FinPath MVP &mdash; Built with React, TypeScript, Flask &amp; Supabase
        </footer>
      )}
    </div>
  )
}

export default App
