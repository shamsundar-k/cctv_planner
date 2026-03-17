import { useState } from 'react'
import {
  useSearchUsers,
  useSearchProjects,
  useAdminProjects,
  useGenerateInvite,
  useDeleteUser,
  useDeleteProject,
  type InviteRecord,
} from '../../api/admin'
import { useToast } from '../ui/Toast'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'projects' | 'invites'

type DeleteModal =
  | { open: false }
  | { open: true; type: 'user' | 'project'; id: string; name: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getExpiryPercent(expiresAt: string, createdAt: string): number {
  const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime()
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

function getExpiryLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) {
    const mins = Math.floor(ms / 60000)
    return `${mins}m remaining`
  }
  if (hours < 24) return `${hours}h remaining`
  const days = Math.floor(hours / 24)
  return `${days}d remaining`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number | string
  color: string
  icon: string
}) {
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: '20px 24px',
        border: `1px solid ${color}33`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#94a3b8' }}>{label}</span>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: color + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div style={{ position: 'relative', maxWidth: 360 }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          fontSize: 16,
          pointerEvents: 'none',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 40,
          paddingLeft: 38,
          paddingRight: 12,
          fontSize: 14,
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 8,
          color: '#f1f5f9',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        verticalAlign: 'middle',
      }}
    />
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const showToast = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [userSearch, setUserSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ open: false })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRecords, setInviteRecords] = useState<InviteRecord[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [inviteEmailError, setInviteEmailError] = useState('')

  const { data: filteredUsers = [], isLoading: usersLoading } = useSearchUsers(userSearch)
  const { data: filteredProjects = [], isLoading: projectsLoading } = useSearchProjects(projectSearch)
  const { data: allProjects = [] } = useAdminProjects()

  const generateInvite = useGenerateInvite()
  const deleteUser = useDeleteUser()
  const deleteProject = useDeleteProject()

  const totalCameras = allProjects.reduce((sum, p) => sum + p.camera_count, 0)
  const activeInviteCount = inviteRecords.filter(
    (r) => new Date(r.expires_at).getTime() > Date.now(),
  ).length

  // ── Handlers ───────────────────────────────────────────────────────────────

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleGenerateInvite(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) {
      setInviteEmailError('Email is required')
      return
    }
    if (!validateEmail(email)) {
      setInviteEmailError('Please enter a valid email address')
      return
    }
    setInviteEmailError('')

    try {
      const result = await generateInvite.mutateAsync(email)
      const record: InviteRecord = {
        ...result,
        email,
        created_at: new Date().toISOString(),
      }
      setInviteRecords((prev) => [record, ...prev])
      setInviteEmail('')
      showToast(`Invite sent to ${email}`, 'success')
    } catch {
      showToast('Failed to generate invite. Please try again.', 'error')
    }
  }

  async function handleConfirmDelete() {
    if (!deleteModal.open) return

    try {
      if (deleteModal.type === 'user') {
        await deleteUser.mutateAsync(deleteModal.id)
        showToast(`User "${deleteModal.name}" deleted`, 'success')
      } else {
        await deleteProject.mutateAsync(deleteModal.id)
        showToast(`Project "${deleteModal.name}" deleted`, 'success')
      }
      setDeleteModal({ open: false })
    } catch {
      showToast('Delete failed. Please try again.', 'error')
    }
  }

  async function handleCopyInvite(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      showToast('Invite URL copied to clipboard', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      showToast('Failed to copy URL', 'error')
    }
  }

  const isDeleting = deleteUser.isPending || deleteProject.isPending

  // ── Styles ─────────────────────────────────────────────────────────────────

  const tabBtnStyle = (tab: Tab): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: activeTab === tab ? '#38bdf8' : '#64748b',
    borderBottom: `2px solid ${activeTab === tab ? '#38bdf8' : 'transparent'}`,
    transition: 'color 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
  })

  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
    borderBottom: '1px solid #1e293b',
    background: '#0f172a',
  }

  const tableCellStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: 14,
    color: '#cbd5e1',
    borderBottom: '1px solid #1e293b',
    verticalAlign: 'middle',
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        padding: '32px 40px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 0 }}>
          Manage users, projects, and invitations
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard label="Total Users" value={filteredUsers.length || allProjects.length > 0 ? (usersLoading ? '—' : filteredUsers.length) : (usersLoading ? '—' : 0)} color="#3b82f6" icon="👥" />
        <StatCard label="Total Projects" value={allProjects.length} color="#06b6d4" icon="📁" />
        <StatCard label="Total Cameras" value={totalCameras} color="#a855f7" icon="📷" />
        <StatCard label="Active Invites" value={activeInviteCount} color="#10b981" icon="✉️" />
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #1e293b',
          marginBottom: 28,
          overflowX: 'auto',
        }}
      >
        {(['overview', 'users', 'projects', 'invites'] as Tab[]).map((tab) => (
          <button key={tab} style={tabBtnStyle(tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' && 'Overview'}
            {tab === 'users' && 'Users'}
            {tab === 'projects' && 'Projects'}
            {tab === 'invites' && 'Invite History'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Summary */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #334155',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 20 }}>
              System Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total Users', value: usersLoading ? '…' : filteredUsers.length },
                { label: 'Total Projects', value: projectsLoading ? '…' : allProjects.length },
                { label: 'Total Cameras', value: totalCameras },
                { label: 'Active Invites (this session)', value: activeInviteCount },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #334155',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick invite */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #334155',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 8 }}>
              Generate Invite Link
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: 0 }}>
              Send a 72-hour invite link to a new user's email address.
            </p>
            <form onSubmit={handleGenerateInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteEmailError('') }}
                  placeholder="user@example.com"
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    fontSize: 14,
                    background: '#0f172a',
                    border: `1px solid ${inviteEmailError ? '#ef4444' : '#334155'}`,
                    borderRadius: 8,
                    color: '#f1f5f9',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {inviteEmailError && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, marginBottom: 0 }}>
                    {inviteEmailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={generateInvite.isPending}
                style={{
                  height: 40,
                  background: generateInvite.isPending ? '#1d4ed8' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: generateInvite.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.15s',
                }}
              >
                {generateInvite.isPending ? (
                  <><Spinner /> Generating…</>
                ) : (
                  'Generate Invite'
                )}
              </button>
            </form>

            {inviteRecords.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>Latest invite:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: '#94a3b8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inviteRecords[0].invite_url}
                  </span>
                  <button
                    onClick={() => handleCopyInvite(inviteRecords[0].invite_url, inviteRecords[0].token)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      background: copiedId === inviteRecords[0].token ? '#059669' : '#334155',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background 0.15s',
                    }}
                  >
                    {copiedId === inviteRecords[0].token ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SearchInput
              value={userSearch}
              onChange={setUserSearch}
              placeholder="Search by name or email…"
            />
            <span style={{ fontSize: 14, color: '#64748b' }}>
              {usersLoading ? '…' : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>User</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Joined</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  // Skeleton rows
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} style={tableCellStyle}>
                          <div
                            style={{
                              height: 14,
                              borderRadius: 4,
                              background: '#334155',
                              width: j === 0 ? '60%' : j === 4 ? '40%' : '80%',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', padding: '40px 16px', color: '#475569' }}>
                      {userSearch ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{ transition: 'background 0.1s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0f172a')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: user.system_role === 'admin' ? '#1d4ed8' : '#334155',
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(user.full_name || user.email)}
                          </div>
                          <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                            {user.full_name || '—'}
                          </span>
                        </div>
                      </td>
                      <td style={tableCellStyle}>{user.email}</td>
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: user.system_role === 'admin' ? '#1d4ed822' : '#33415522',
                            color: user.system_role === 'admin' ? '#60a5fa' : '#94a3b8',
                            border: `1px solid ${user.system_role === 'admin' ? '#1d4ed844' : '#33415544'}`,
                          }}
                        >
                          {user.system_role}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{formatDate(user.created_at)}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              type: 'user',
                              id: user.id,
                              name: user.full_name || user.email,
                            })
                          }
                          style={{
                            padding: '6px 14px',
                            fontSize: 13,
                            background: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef444433',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef444422'
                            e.currentTarget.style.borderColor = '#ef4444'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = '#ef444433'
                          }}
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
      )}

      {/* ── Projects Tab ── */}
      {activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SearchInput
              value={projectSearch}
              onChange={setProjectSearch}
              placeholder="Search by project name…"
            />
            <span style={{ fontSize: 14, color: '#64748b' }}>
              {projectsLoading ? '…' : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {projectsLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#1e293b',
                    borderRadius: 12,
                    padding: 20,
                    border: '1px solid #334155',
                    height: 140,
                  }}
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#475569',
                fontSize: 14,
              }}
            >
              {projectSearch ? 'No projects match your search.' : 'No projects found.'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    background: '#1e293b',
                    borderRadius: 12,
                    padding: 20,
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#475569')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#f1f5f9',
                        margin: '0 0 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.name}
                    </h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Owner: {project.owner_id}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#a855f7' }}>
                        {project.camera_count}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>cameras</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>
                        {formatDate(project.created_at)}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>created</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      style={{
                        flex: 1,
                        height: 34,
                        background: 'transparent',
                        color: '#38bdf8',
                        border: '1px solid #38bdf833',
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#38bdf811')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          type: 'project',
                          id: project.id,
                          name: project.name,
                        })
                      }
                      style={{
                        flex: 1,
                        height: 34,
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef444433',
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#ef444422')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Invite History Tab ── */}
      {activeTab === 'invites' && (
        <div>
          {inviteRecords.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#475569',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
              <p style={{ fontSize: 14, margin: 0 }}>
                No invites generated this session. Use the Overview tab to generate invite links.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inviteRecords.map((record) => {
                const pct = getExpiryPercent(record.expires_at, record.created_at)
                const isExpired = pct <= 0
                const barColor = isExpired ? '#475569' : pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444'

                return (
                  <div
                    key={record.token}
                    style={{
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: 20,
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>
                          {record.email}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                          Generated {formatDate(record.created_at)} · Expires {formatDate(record.expires_at)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isExpired ? '#64748b' : barColor,
                          background: (isExpired ? '#47556922' : barColor + '22'),
                          padding: '3px 10px',
                          borderRadius: 20,
                          border: `1px solid ${isExpired ? '#47556944' : barColor + '44'}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isExpired ? 'Expired' : getExpiryLabel(record.expires_at)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: 4,
                        background: '#0f172a',
                        borderRadius: 2,
                        marginBottom: 12,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: barColor,
                          borderRadius: 2,
                          transition: 'width 1s linear',
                        }}
                      />
                    </div>

                    {/* URL row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12,
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: 'monospace',
                          background: '#0f172a',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #1e293b',
                        }}
                      >
                        {record.invite_url}
                      </span>
                      <button
                        onClick={() => handleCopyInvite(record.invite_url, record.token)}
                        disabled={isExpired}
                        style={{
                          padding: '6px 14px',
                          fontSize: 13,
                          background: copiedId === record.token ? '#059669' : isExpired ? '#1e293b' : '#334155',
                          color: isExpired ? '#475569' : '#f1f5f9',
                          border: 'none',
                          borderRadius: 6,
                          cursor: isExpired ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                      >
                        {copiedId === record.token ? '✓ Copied' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModal({ open: false })
          }}
        >
          <div
            style={{
              background: '#1e293b',
              borderRadius: 16,
              padding: 28,
              maxWidth: 420,
              width: '100%',
              border: '1px solid #334155',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#ef444422',
                  border: '1px solid #ef444444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                  Delete {deleteModal.type === 'user' ? 'User' : 'Project'}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 8px' }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#f1f5f9' }}>"{deleteModal.name}"</strong>?
            </p>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>
              This action cannot be undone.
              {deleteModal.type === 'project' && ' All cameras and data in this project will be permanently removed.'}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModal({ open: false })}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.background = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  background: isDeleting ? '#b91c1c' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.background = '#ef4444')}
              >
                {isDeleting ? <><Spinner /> Deleting…</> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
