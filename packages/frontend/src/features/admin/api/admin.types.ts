export interface AdminUser {
  id: string
  email: string
  full_name: string
  system_role: 'admin' | 'user'
  created_at: string
}

export interface AdminProjectStats {
  total_projects: number
}

export interface AdminPasswordResetRequest {
  id: string
  user_id: string
  email: string
  status: 'pending'
  created_at: string
}
