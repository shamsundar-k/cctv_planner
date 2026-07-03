export type Tab = 'users' | 'cameras' | 'invites'

export type DeleteModalState =
  | { open: false }
  | { open: true; type: 'user' | 'invite'; id: string; name: string }
