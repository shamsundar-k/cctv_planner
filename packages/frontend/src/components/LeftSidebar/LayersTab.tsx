import { useMapViewStore, type BasemapStyle } from '../../store/mapViewSlice'
import { useCameraLayerStore } from '../../store/cameraLayerSlice'
import ToggleRow from './ToggleRow'

const BASEMAP_OPTIONS: { value: BasemapStyle; label: string }[] = [
  { value: 'alidade_smooth', label: 'Smooth (Light)' },
  { value: 'alidade_smooth_dark', label: 'Smooth (Dark)' },
  { value: 'stamen_toner', label: 'Toner (B&W)' },
]

export default function LayersTab() {
  // const { showFovPolygons, showZonePolygons, basemapStyle, setShowFovPolygons, setShowZonePolygons, setBasemapStyle } = useMapViewStore()
  // const { showCameraLabels, setShowCameraLabels } = useCameraLayerStore()

  return (
    <div className="flex flex-col gap-3">
      {/* Overlay toggles */}
      {/* <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1 mb-1">
          Overlays
        </p>
        <ToggleRow label="FOV Polygons" checked={showFovPolygons} onChange={setShowFovPolygons} />
        <ToggleRow label="Zone Polygons" checked={showZonePolygons} onChange={setShowZonePolygons} />
        <ToggleRow label="Camera Labels" checked={showCameraLabels} onChange={setShowCameraLabels} />
      </div> */}

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
              className={`flex items-center gap-2 h-8 px-2 rounded border-none cursor-pointer text-xs transition-colors text-left ${basemapStyle === opt.value
                ? 'bg-blue-600/30 text-slate-100'
                : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border shrink-0 ${basemapStyle === opt.value ? 'bg-blue-500 border-blue-400' : 'border-slate-500'
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
