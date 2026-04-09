import client from '../../../api/interceptors'
import { decodeJwt } from '../../../utils/jwt'
import type { AuthUser } from '../../../store/authSlice'

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface LoginResult {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const { data } = await client.post<TokenResponse>('/auth/login', { email, password })

  const payload = decodeJwt(data.access_token)
  const user: AuthUser = {
    id: payload.sub,
    email,
    fullName: '',
    role: payload.role as AuthUser['role'],
  }

  return { user, accessToken: data.access_token, refreshToken: data.refresh_token }
}
