import client from '@/api/client'

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface ChangedPasswordTokens {
  accessToken: string
  refreshToken: string
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangedPasswordTokens> {
  const { data } = await client.post<TokenResponse>('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}
