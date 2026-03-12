interface EmptyStateProps {
  onCreateClick: () => void
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      {/* Target icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ marginBottom: 24, opacity: 0.35 }}
      >
        <circle cx="32" cy="32" r="28" stroke="#0066cc" strokeWidth="3" />
        <circle cx="32" cy="32" r="18" stroke="#0066cc" strokeWidth="3" />
        <circle cx="32" cy="32" r="8" fill="#0066cc" />
        <line x1="32" y1="4" x2="32" y2="14" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="50" x2="32" y2="60" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="32" x2="14" y2="32" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="32" x2="60" y2="32" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
        No Projects Yet
      </h2>
      <p style={{ fontSize: 14, color: '#666666', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
        Create your first CCTV survey project to get started. Plan camera placements, define coverage
        zones, and generate reports.
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={onCreateClick}
          style={{
            height: 40,
            padding: '0 20px',
            background: '#0066cc',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0052a3')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0066cc')}
        >
          + Create Project
        </button>
        <a
          href="#"
          style={{
            height: 40,
            padding: '0 20px',
            background: '#ffffff',
            color: '#0066cc',
            border: '1px solid #0066cc',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          View Documentation
        </a>
      </div>
    </div>
  )
}
