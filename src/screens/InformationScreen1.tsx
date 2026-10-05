import React, { useState } from 'react'
import PrimaryButton from '../components/PrimaryButton'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'

interface PersonalDetails {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
}

interface InformationScreen1Props {
  data: PersonalDetails
  onNext: (data: PersonalDetails) => void
  onBack: () => void
}

const InformationScreen1: React.FC<InformationScreen1Props> = ({
  data,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<PersonalDetails>(data)
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetails, string>>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof PersonalDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalDetails, string>> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-+()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'

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
        title="Personal Details"
        subtitle="Tell us a bit about yourself so we can personalise your experience."
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      >
        <FormInput
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
          error={errors.fullName}
        />

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane.doe@example.com"
          required
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+61 400 000 000"
            required
            error={errors.phone}
          />

          <FormInput
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            error={errors.dateOfBirth}
          />
        </div>
      </FormSection>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <PrimaryButton variant="secondary" onClick={onBack}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </PrimaryButton>
        <PrimaryButton type="submit" variant="primary">
          Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </PrimaryButton>
      </div>
    </form>
  )
}

export default InformationScreen1
