import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '../../../store/authSlice'
import { validateInviteToken, acceptInvite } from '../api/acceptInvite'
import type { InvitePreview, Stage } from '../api/acceptInvite.types'

export function useAcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const token = searchParams.get('token') ?? ''

  const [stage, setStage] = useState<Stage>('loading')
  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [invalidMsg, setInvalidMsg] = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setInvalidMsg('No invite token found in the URL.')
      setStage('invalid')
      return
    }

    validateInviteToken(token)
      .then((data) => {
        setPreview(data)
        setStage('form')
      })
      .catch(() => {
        setInvalidMsg('This invite link is invalid or has expired.')
        setStage('invalid')
      })
  }, [token])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }

    setStage('submitting')

    try {
      const result = await acceptInvite(token, fullName, password, preview!.email)
      setAuth(result.user, result.accessToken, result.refreshToken)
      navigate('/')
    } catch {
      setFormError('Registration failed. The invite may have already been used.')
      setStage('form')
    }
  }

  return {
    stage,
    preview,
    invalidMsg,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    formError,
    handleSubmit,
  }
}
