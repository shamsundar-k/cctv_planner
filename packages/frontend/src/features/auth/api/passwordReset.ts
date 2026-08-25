import client from '@/api/client'

interface PasswordResetRequestResponse {
  message: string
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await client.post<PasswordResetRequestResponse>(
    '/auth/password-reset-requests',
    { email },
  )
  return data.message
}
