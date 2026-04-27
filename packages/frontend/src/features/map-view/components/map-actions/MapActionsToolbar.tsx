import { Camera, Plus, Ruler, Spline, Pentagon } from 'lucide-react'
import { useSelectedCameraModelStore } from '../../../../store/selectedCameraModelSlice'
import { useMapActionsStore } from '../../../../store/mapActionsSlice'
import MapActionButton from './MapActionButton'

function PlaceCameraIcon() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <Camera size={15} />
      <Plus size={8} strokeWidth={3} className="absolute -top-1 -right-1 text-accent" />
    </span>
  )
}

const DIVIDER = <div className="w-px h-4 mx-0.5 shrink-0 bg-surface/40" />

export default function MapActionsToolbar() {
  const selectedCameraModel = useSelectedCameraModelStore((s) => s.selectedCameraModel)
  const activeTool = useMapActionsStore((s) => s.activeTool)
  const setActiveTool = useMapActionsStore((s) => s.setActiveTool)

  const placeCameraTooltip = selectedCameraModel ? selectedCameraModel.name : 'Select a camera model'

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-card/80 border border-surface/25 backdrop-blur-[8px] shadow-xl">
      <MapActionButton
        icon={<PlaceCameraIcon />}
        label="Place Camera"
        tooltip={placeCameraTooltip}
        isActive={activeTool === 'place-camera'}
        disabled={selectedCameraModel === null}
        onClick={() => setActiveTool(activeTool === 'place-camera' ? 'pan' : 'place-camera')}
      />

      {DIVIDER}

      <MapActionButton icon={<Ruler size={15} />} label="Measure Distance" />
      <MapActionButton icon={<Spline size={15} />} label="Draw Line" onClick={() => setActiveTool(activeTool === 'draw-line' ? 'pan' : 'draw-line')} isActive={activeTool === 'draw-line'} />
      <MapActionButton icon={<Pentagon size={15} />} label="Draw Polygon" onClick={() => setActiveTool(activeTool === 'draw-polygon' ? 'pan' : 'draw-polygon')} isActive={activeTool === 'draw-polygon'} />
    </div>
  )
}
