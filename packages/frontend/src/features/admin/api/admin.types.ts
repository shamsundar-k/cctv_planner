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
  created_by_id: string
  camera_count: number
  created_at: string
}
