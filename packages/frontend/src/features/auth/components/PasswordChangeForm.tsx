import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { PrimaryButton } from '@/components/Buttons'
import { changePassword } from '../api/changePassword'
import FormField from './FormField'
import LoginErrorBanner from './LoginErrorBanner'

interface PasswordChangeFormProps {
  onChanged: (accessToken: string, refreshToken: string) => void
}

export default function PasswordChangeForm({ onChanged }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Your new password must contain at least 8 characters.')
      return
    }
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError('Your new password must be at most 72 bytes.')
      return
    }
    if (newPassword === 'login@123') {
      setError('Choose a password other than the temporary password.')
      return
    }
    if (newPassword === currentPassword) {
      setError('Your new password must be different from the current password.')
      return
    }

    setSubmitting(true)
    try {
      const tokens = await changePassword(currentPassword, newPassword)
      onChanged(tokens.accessToken, tokens.refreshToken)
    } catch (requestError) {
      const detail = axios.isAxiosError<{ detail?: string }>(requestError)
        ? requestError.response?.data?.detail
        : undefined
      setError(detail ?? 'Unable to change your password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField
        id="temporary-password"
        label="Temporary Password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Enter your temporary password"
      />

      <FormField
        id="new-password"
        label="New Password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="At least 8 characters"
      />

      <FormField
        id="confirm-new-password"
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Enter the new password again"
      />

      {error && <LoginErrorBanner message={error} />}

      <PrimaryButton
        type="submit"
        loading={submitting}
        size="xlarge"
        fullWidth
      >
        {submitting ? 'Updating password...' : 'Set new password'}
      </PrimaryButton>
    </form>
  )
}
