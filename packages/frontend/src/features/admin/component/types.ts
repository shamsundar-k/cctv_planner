export type Tab = 'users' | 'projects' | 'cameras' | 'invites'

export type DeleteModalState =
  | { open: false }
  | { open: true; type: 'user' | 'project' | 'invite'; id: string; name: string }
