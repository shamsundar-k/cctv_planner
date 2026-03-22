import { useEffect } from 'react'
import { useMapViewStore, type ActiveTool } from '../../store/mapViewSlice'

type ToolGroup = {
  tools: { id: ActiveTool; label: string; icon: React.ReactNode }[]
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    tools: [
      {
        id: 'pan',
        label: 'Pan',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M8 8c0-1.1.9-2 2-2h0a2 2 0 0 1 2 2v4l2-1v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3l1.5-.5L8 12V8z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: 'select',
        label: 'Select',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 2l14 9-7 1-4 6L5 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    tools: [
      {
        id: 'place-camera',
        label: 'Place Camera',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 10l5-3v10l-5-3V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19 2v4M17 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        id: 'draw-polygon',
        label: 'Draw Zone',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3L20 9v6l-8 6-8-6V9L12 3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: 'draw-line',
        label: 'Draw Line',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="4" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5.4" y1="18.6" x2="18.6" y2="5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    tools: [
      {
        id: 'measure',
        label: 'Measure',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="2"
              y="9"
              width="20"
              height="6"
              rx="1"
              transform="rotate(-45 2 9)"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7.05 16.95l2-2M10.05 13.95l1-1M13.05 10.95l2-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
]

export default function BottomToolbar() {
  const activeTool = useMapViewStore((s) => s.activeTool)
  const setActiveTool = useMapViewStore((s) => s.setActiveTool)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTool('pan')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool])

  return (
    <div className="h-12 shrink-0 bg-slate-800 border-t border-slate-700 flex items-center px-4 gap-1 z-[100]">
      {TOOL_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {gi > 0 && <div className="w-px h-6 bg-slate-600 mx-1" />}
          {group.tools.map((tool) => {
            const isActive = activeTool === tool.id
            return (
              <button
                key={tool.id}
                title={tool.label}
                onClick={() => setActiveTool(tool.id)}
                className={[
                  'flex items-center gap-1.5 h-8 px-2.5 rounded-md border-none cursor-pointer text-xs font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-100',
                ].join(' ')}
              >
                {tool.icon}
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
