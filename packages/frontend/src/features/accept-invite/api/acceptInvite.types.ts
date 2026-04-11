export interface InvitePreview {
  email: string
  expires_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
}

export type Stage = 'loading' | 'invalid' | 'form' | 'submitting'
