/*
 * FILE SUMMARY — src/components/admin/UsersTab.tsx
 *
 * Users tab panel in the admin dashboard. Displays a searchable table of all
 * registered users.
 *
 * UsersTab({ users, usersLoading, userSearch, onSearchChange, onDeleteUser })
 *   — Renders:
 *   - A <SearchInput> for filtering users by name or email (controlled via
 *     `userSearch` / `onSearchChange` props, debounced upstream).
 *   - A user count badge showing how many results match the current search.
 *   - A table with columns: User (avatar + name), Email, Role (badge),
 *     Joined date, and an Actions column.
 *   - Skeleton placeholder rows (4 rows × 5 cells) while `usersLoading` is
 *     true.
 *   - An empty-state row when the filtered list is empty.
 *   - For each user row, a "Delete" button that calls `onDeleteUser(id, name)`
 *     to open the confirmation modal in AdminDashboard.
 *
 * Avatar initials are rendered using `getInitials()` from admin/utils.ts.
 * Join date is formatted using `formatDate()` from admin/utils.ts.
 */
import type { AdminUser } from '../../api/admin'
import SearchInput from './SearchInput'
import { formatDate, getInitials } from './utils'

interface UsersTabProps {
  users: AdminUser[]
  usersLoading: boolean
  userSearch: string
  onSearchChange: (v: string) => void
  onDeleteUser: (id: string, name: string) => void
}

const thClass = 'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left border-b border-slate-800 bg-slate-900'
const tdClass = 'px-4 py-3.5 text-sm text-slate-300 border-b border-slate-800 align-middle'

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
        <span className="text-sm text-slate-500">
          {usersLoading ? '…' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>User</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Joined</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className={tdClass}>
                      <div
                        className={`h-3.5 rounded bg-slate-700 animate-pulse ${
                          j === 0 ? 'w-3/5' : j === 4 ? 'w-2/5' : 'w-4/5'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${tdClass} text-center py-10 text-slate-600`}>
                  {userSearch ? 'No users match your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-900"
                >
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${
                          user.system_role === 'admin' ? 'bg-blue-800' : 'bg-slate-700'
                        }`}
                      >
                        {getInitials(user.full_name || user.email)}
                      </div>
                      <span className="text-slate-100 font-medium">
                        {user.full_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className={tdClass}>{user.email}</td>
                  <td className={tdClass}>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        user.system_role === 'admin'
                          ? 'bg-blue-800/15 text-blue-400 border-blue-800/30'
                          : 'bg-slate-700/15 text-slate-400 border-slate-700/30'
                      }`}
                    >
                      {user.system_role}
                    </span>
                  </td>
                  <td className={tdClass}>{formatDate(user.created_at)}</td>
                  <td className={`${tdClass} text-right`}>
                    <button
                      onClick={() => onDeleteUser(user.id, user.full_name || user.email)}
                      className="px-3.5 py-1.5 text-[13px] bg-transparent text-red-500 border border-red-500/20 rounded-md cursor-pointer transition-colors hover:bg-red-500/10 hover:border-red-500"
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
