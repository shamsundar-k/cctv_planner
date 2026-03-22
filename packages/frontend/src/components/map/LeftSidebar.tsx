import { useState } from 'react'
import { Link } from 'react-router'
import { useCameraInstances } from '../../api/cameraInstances'
import { useImportedCameras } from '../../api/projects'
import { useMapViewStore, type BasemapStyle } from '../../store/mapViewSlice'

type TabId = 'cameras' | 'layers' | 'models'

interface LeftSidebarProps {
  projectId: string
  collapsed: boolean
  onToggleCollapse: () => void
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'cameras',
    label: 'Cameras',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10l5-3v10l-5-3V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'layers',
    label: 'Layers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'models',
    label: 'Models',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

// ── Eye icon ────────────────────────────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Toggle row ──────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 h-8 px-1 rounded cursor-pointer hover:bg-slate-700/40 group">
      <span className="text-xs text-slate-300 group-hover:text-slate-100 select-none">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full border-none cursor-pointer transition-colors shrink-0 ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  )
}

// ── Cameras tab ─────────────────────────────────────────────────────────────────

function CamerasTab({ projectId }: { projectId: string }) {
  const { data: cameras, isLoading } = useCameraInstances(projectId)
  const { selectedCameraId, hiddenCameraIds, setSelectedCamera, toggleCameraVisibility } = useMapViewStore()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-slate-700/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!cameras || cameras.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic px-1 pt-2 leading-relaxed">
        No cameras placed yet. Use the toolbar to place a camera.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {cameras.map((cam) => {
        const isSelected = cam.id === selectedCameraId
        const isVisible = !hiddenCameraIds.includes(cam.id)
        const displayLabel = cam.label || 'Untitled Camera'

        return (
          <li key={cam.id}>
            <div
              className={`flex items-center gap-2 h-8 px-1 rounded cursor-pointer group transition-colors ${
                isSelected
                  ? 'bg-blue-600/30 text-slate-100'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
              }`}
              onClick={() => setSelectedCamera(isSelected ? null : cam.id)}
            >
              {/* Colour dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cam.colour }}
              />

              {/* Label */}
              <span className="flex-1 text-xs truncate select-none">{displayLabel}</span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCameraVisibility(cam.id)
                }}
                title={isVisible ? 'Hide camera' : 'Show camera'}
                className={`shrink-0 p-0.5 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  isVisible
                    ? 'text-slate-500 hover:text-slate-100 opacity-0 group-hover:opacity-100'
                    : 'text-slate-400 opacity-100'
                }`}
              >
                <EyeIcon visible={isVisible} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ── Layers tab ──────────────────────────────────────────────────────────────────

const BASEMAP_OPTIONS: { value: BasemapStyle; label: string }[] = [
  { value: 'alidade_smooth', label: 'Smooth (Light)' },
  { value: 'alidade_smooth_dark', label: 'Smooth (Dark)' },
  { value: 'stamen_toner', label: 'Toner (B&W)' },
]

function LayersTab() {
  const {
    showFovPolygons,
    showZonePolygons,
    showCameraLabels,
    basemapStyle,
    setShowFovPolygons,
    setShowZonePolygons,
    setShowCameraLabels,
    setBasemapStyle,
  } = useMapViewStore()

  return (
    <div className="flex flex-col gap-3">
      {/* Overlay toggles */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1 mb-1">
          Overlays
        </p>
        <ToggleRow label="FOV Polygons" checked={showFovPolygons} onChange={setShowFovPolygons} />
        <ToggleRow label="Zone Polygons" checked={showZonePolygons} onChange={setShowZonePolygons} />
        <ToggleRow label="Camera Labels" checked={showCameraLabels} onChange={setShowCameraLabels} />
      </div>

      {/* Base map selector */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1 mb-1">
          Base Map
        </p>
        <div className="flex flex-col gap-0.5">
          {BASEMAP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBasemapStyle(opt.value)}
              className={`flex items-center gap-2 h-8 px-2 rounded border-none cursor-pointer text-xs transition-colors text-left ${
                basemapStyle === opt.value
                  ? 'bg-blue-600/30 text-slate-100'
                  : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                  basemapStyle === opt.value ? 'bg-blue-500 border-blue-400' : 'border-slate-500'
                }`}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Models tab ──────────────────────────────────────────────────────────────────

const CAMERA_TYPE_LABELS: Record<string, string> = {
  fixed_dome: 'Dome',
  ptz: 'PTZ',
  bullet: 'Bullet',
}

function ModelsTab({ projectId }: { projectId: string }) {
  const { data: importedItems, isLoading } = useImportedCameras(projectId)
  const { selectedModelId, setSelectedModel } = useMapViewStore()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded bg-slate-700/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!importedItems || importedItems.length === 0) {
    return (
      <div className="pt-2 px-1">
        <p className="text-xs text-slate-500 italic leading-relaxed mb-2">
          No camera models imported for this project.
        </p>
        <Link
          to={`/project/manage/${projectId}`}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Manage imported cameras →
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {importedItems.map(({ camera_model }) => {
        const isSelected = camera_model.id === selectedModelId
        const typeLabel = CAMERA_TYPE_LABELS[camera_model.camera_type] ?? camera_model.camera_type

        return (
          <li key={camera_model.id}>
            <button
              onClick={() => setSelectedModel(isSelected ? null : camera_model.id)}
              className={`w-full flex flex-col gap-0.5 px-2 py-1.5 rounded border-none cursor-pointer text-left transition-colors ${
                isSelected
                  ? 'bg-blue-600/30 text-slate-100'
                  : 'bg-transparent text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
              }`}
            >
              <span className="text-xs font-medium truncate leading-tight">
                {camera_model.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 truncate leading-tight">
                  {camera_model.manufacturer}
                </span>
                <span className="text-[10px] px-1 py-px rounded bg-slate-700 text-slate-400 shrink-0">
                  {typeLabel}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function LeftSidebar({ projectId, collapsed, onToggleCollapse }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>('cameras')

  return (
    <aside
      className="shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col relative transition-[width] duration-200"
      style={{ width: collapsed ? 44 : 236 }}
    >
      {/* Tab buttons */}
      <div className="flex flex-col pt-2 gap-0.5 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={collapsed ? tab.label : undefined}
            className={`flex items-center gap-2.5 h-9 px-2 rounded-md border-none cursor-pointer text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${
              activeTab === tab.id
                ? 'bg-slate-700 text-slate-100'
                : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span className="shrink-0">{tab.icon}</span>
            {!collapsed && <span>{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Tab content area */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {activeTab === 'cameras' && <CamerasTab projectId={projectId} />}
          {activeTab === 'layers' && <LayersTab />}
          {activeTab === 'models' && <ModelsTab projectId={projectId} />}
        </div>
      )}

      {/* Collapse toggle button — pinned to bottom */}
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-slate-100 hover:bg-slate-600 flex items-center justify-center cursor-pointer transition-colors z-10"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  )
}
