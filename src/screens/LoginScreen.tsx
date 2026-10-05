import React, { useState } from 'react'
import PrimaryButton from '../components/PrimaryButton'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'

interface LoginScreenProps {
  onLogin: (accessToken: string) => void
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }

      if (result.error) {
        setErrors({ general: result.error.message })
        setLoading(false)
        return
      }

      const session = result.data.session
      if (session?.access_token) {
        onLogin(session.access_token)
      } else if (isSignUp) {
        const signInResult = await supabase.auth.signInWithPassword({ email, password })
        if (signInResult.data.session?.access_token) {
          onLogin(signInResult.data.session.access_token)
        } else {
          setErrors({ general: 'Account created! Check your email to confirm, then sign in.' })
          setIsSignUp(false)
        }
      }
      setLoading(false)
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/30 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            FinPath
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your financial journey starts here
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xl shadow-gray-200/40 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-1">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isSignUp
              ? 'Sign up to start your financial profile'
              : 'Sign in to continue to your dashboard'}
          </p>

          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {loading ? (
            <div className="py-12">
              <LoadingSpinner message={isSignUp ? 'Creating your account...' : 'Signing you in...'} />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail((e.target as HTMLInputElement).value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="you@example.com"
              required
              error={errors.email}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword((e.target as HTMLInputElement).value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              placeholder="Enter your password"
              required
              error={errors.password}
            />

            <div className="pt-2">
              <PrimaryButton
                type="submit"
                variant="primary"
                className="w-full"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </PrimaryButton>
            </div>
          </form>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrors({}) }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secured by Supabase Authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
