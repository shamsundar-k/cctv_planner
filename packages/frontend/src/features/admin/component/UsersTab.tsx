import type { AdminUser } from '../api/admin.types'
import SearchInput from './SearchInput'
import { formatDate, getInitials } from './utils'

interface UsersTabProps {
  users: AdminUser[]
  usersLoading: boolean
  userSearch: string
  onSearchChange: (v: string) => void
  onDeleteUser: (id: string, name: string) => void
}

const thClass = `px-4 py-3 text-xs font-bold uppercase tracking-wider text-left border-b`
const tdClass = `px-4 py-3.5 text-sm border-b align-middle`

export default function UsersTab({
  users,
  usersLoading,
  userSearch,
  onSearchChange,
  onDeleteUser,
}: UsersTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <SearchInput
          value={userSearch}
          onChange={onSearchChange}
          placeholder="Search by name or email…"
        />
        <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          {usersLoading ? '…' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['User', 'Email', 'Role', 'Joined', ''].map((h, i) => (
                <th
                  key={i}
                  className={`${thClass} ${i === 4 ? 'text-right' : ''}`}
                  style={{ color: 'var(--theme-text-secondary)', borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', background: 'color-mix(in srgb, var(--theme-surface) 8%, transparent)' }}
                >{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className={tdClass} style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>
                      <div
                        className={`h-3.5 rounded animate-pulse ${j === 0 ? 'w-3/5' : j === 4 ? 'w-2/5' : 'w-4/5'}`}
                        style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${tdClass} text-center py-10`} style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 40%, transparent)', borderColor: 'transparent' }}>
                  {userSearch ? 'No users match your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 8%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className={tdClass} style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: user.system_role === 'admin' ? 'color-mix(in srgb, var(--theme-accent) 30%, transparent)' : 'color-mix(in srgb, var(--theme-surface) 25%, transparent)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        {getInitials(user.full_name || user.email)}
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                        {user.full_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className={tdClass} style={{ color: 'var(--theme-text-secondary)', borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>{user.email}</td>
                  <td className={tdClass} style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        color: user.system_role === 'admin' ? 'var(--theme-accent-text)' : 'var(--theme-text-secondary)',
                        background: user.system_role === 'admin' ? 'color-mix(in srgb, var(--theme-accent) 20%, transparent)' : 'color-mix(in srgb, var(--theme-surface) 15%, transparent)',
                        borderColor: user.system_role === 'admin' ? 'color-mix(in srgb, var(--theme-accent) 40%, transparent)' : 'color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                      }}
                    >
                      {user.system_role}
                    </span>
                  </td>
                  <td className={tdClass} style={{ color: 'var(--theme-text-secondary)', borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>{formatDate(user.created_at)}</td>
                  <td className={`${tdClass} text-right`} style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>
                    <button
                      onClick={() => onDeleteUser(user.id, user.full_name || user.email)}
                      className="px-3.5 py-1.5 text-[13px] bg-transparent border rounded-lg cursor-pointer transition-colors font-semibold"
                      style={{ color: 'var(--theme-accent)', borderColor: 'color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
