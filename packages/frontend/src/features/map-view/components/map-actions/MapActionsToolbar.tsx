import { Camera, Plus, Ruler, Spline, Pentagon } from 'lucide-react'
import { useSelectedCameraModelStore } from '../../../../store/selectedCameraModelSlice'
import { useMapActionsStore } from '../../../../store/mapActionsSlice'
import MapActionButton from './MapActionButton'

function PlaceCameraIcon() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <Camera size={15} />
      <Plus size={8} strokeWidth={3} className="absolute -right-1 -top-1" />
    </span>
  )
}

const DIVIDER = <div className="mx-0.5 h-5 w-px shrink-0 bg-divider" />

export default function MapActionsToolbar() {
  const selectedCameraModel = useSelectedCameraModelStore((s) => s.selectedCameraModel)
  const activeTool = useMapActionsStore((s) => s.activeTool)
  const setActiveTool = useMapActionsStore((s) => s.setActiveTool)

  const placeCameraTooltip = selectedCameraModel ? selectedCameraModel.name : 'Select a camera model'

  return (
    <div className="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-1 rounded-lg border border-panel-border bg-panel/90 p-1.5 shadow-xl backdrop-blur-md">
      <MapActionButton
        icon={<PlaceCameraIcon />}
        label="Place Camera"
        tooltip={placeCameraTooltip}
        isActive={activeTool === 'place-camera'}
        disabled={selectedCameraModel === null}
        onClick={() => setActiveTool(activeTool === 'place-camera' ? 'pan' : 'place-camera')}
      />

      {DIVIDER}

      <MapActionButton icon={<Ruler size={15} />} label="Measure Distance" onClick={() => setActiveTool(activeTool === 'measure' ? 'pan' : 'measure')} isActive={activeTool === 'measure'} />
      <MapActionButton icon={<Spline size={15} />} label="Draw Line" onClick={() => setActiveTool(activeTool === 'draw-line' ? 'pan' : 'draw-line')} isActive={activeTool === 'draw-line'} />
      <MapActionButton icon={<Pentagon size={15} />} label="Draw Polygon" onClick={() => setActiveTool(activeTool === 'draw-polygon' ? 'pan' : 'draw-polygon')} isActive={activeTool === 'draw-polygon'} />
    </div>
  )
}
