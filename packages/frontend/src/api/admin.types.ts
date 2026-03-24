export interface AdminUser {
  id: string
  email: string
  full_name: string
  system_role: 'admin' | 'user'
  created_at: string
}

export interface AdminProject {
  id: string
  name: string
  owner_id: string
  camera_count: number
  created_at: string
}

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
