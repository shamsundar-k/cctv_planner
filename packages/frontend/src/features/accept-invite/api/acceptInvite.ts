import client from '../../../api/interceptors'
import { decodeJwt } from '../../../utils/jwt'
import type { AuthUser } from '../../../store/authSlice'
import type { InvitePreview, TokenResponse } from './acceptInvite.types'

export async function validateInviteToken(token: string): Promise<InvitePreview> {
  const { data } = await client.get<InvitePreview>(
    `/auth/accept-invite?token=${encodeURIComponent(token)}`,
  )
  return data
}

export interface AcceptInviteResult {
  user: AuthUser
  accessToken: string
  refreshToken: string
  email: string
}

export async function acceptInvite(
  token: string,
  fullName: string,
  password: string,
  email: string,
): Promise<AcceptInviteResult> {
  const { data } = await client.post<TokenResponse>('/auth/accept-invite', {
    token,
    full_name: fullName,
    password,
  })

  const payload = decodeJwt(data.access_token)
  const user: AuthUser = {
    id: payload.sub,
    email,
    fullName,
    role: payload.role as AuthUser['role'],
  }

  return { user, accessToken: data.access_token, refreshToken: data.refresh_token, email }
}
