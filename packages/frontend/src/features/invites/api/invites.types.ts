export interface InviteResponse {
  id: string
  invite_url: string
  expires_at: string
}

export interface AdminInvite {
  id: string
  email: string
  invited_by_email: string
  created_at: string
  expires_at: string
}
