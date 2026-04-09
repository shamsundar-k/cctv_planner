export type Tab = 'overview' | 'users' | 'projects' | 'invites'

export type DeleteModalState =
  | { open: false }
  | { open: true; type: 'user' | 'project' | 'invite'; id: string; name: string }
