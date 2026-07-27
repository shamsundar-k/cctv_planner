import { useEffect } from 'react'
import L from 'leaflet'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'
import { useBaseTileStore } from '@/store/baseTileStore'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import { BASE_MAPS, type BasemapLabelTone } from '@/config/mapConfig'
import { moveCoverageArea } from '@/features/map-view/utils/coverageArea'

const BASE_SIZE = 32
const BASE_ZOOM = 18

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] ?? character)
}

function buildCameraIcon(
  colour: string,
  selected: boolean,
  bearing: number,
  label: string,
  zoom: number,
  labelTone: BasemapLabelTone,
): L.DivIcon {
  const size = Math.max(16, Math.min(56, Math.round(BASE_SIZE * Math.pow(2, zoom - BASE_ZOOM))))
  const half = size / 2
  // Selection ring sits inside the icon, scaled proportionally (ring is 26/32 of base size)
  const ringSize = Math.round(size * 0.8125)
  const ringOffset = Math.round((size - ringSize) / 2)
  const selectionDiv = selected
    ? `<div style="position:absolute;top:${ringOffset}px;left:${ringOffset}px;width:${ringSize}px;height:${ringSize}px;border-radius:50%;box-shadow:0 0 0 3px white,0 0 0 5.5px rgba(0,0,0,0.55);pointer-events:none;"></div>`
    : ''
  const labelColour = labelTone === 'light' ? '#ffffff' : '#111827'
  const labelShadow = labelTone === 'light'
    ? '0 1px 3px rgba(0,0,0,0.95),0 0 6px rgba(0,0,0,0.75)'
    : '0 1px 2px rgba(255,255,255,1),0 0 5px rgba(255,255,255,0.95)'
  const html = `
    <div style="position:relative;width:${size}px;">
      ${selectionDiv}
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="${colour}"/>
        <g transform="rotate(${bearing - 90}, 16, 16)">
          <g transform="translate(8.5,10)">
            <rect x="0" y="2" width="10" height="7" rx="1.5" stroke="white" stroke-width="1.5"/>
            <path d="M10 4l3.5-2v7L10 7V4z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="5" cy="5.5" r="1.5" stroke="white" stroke-width="1.5"/>
          </g>
        </g>
      </svg>
      <div style="position:absolute;top:${size + 3}px;left:50%;transform:translateX(-50%);white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;font-size:10px;font-weight:600;line-height:1;color:${labelColour};text-shadow:${labelShadow};pointer-events:none;text-align:center;">
        ${escapeHtml(label)}
      </div>
    </div>
  `
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [half, half] })
}

interface CameraMarkerProps {
  cameraId: string
  group: L.LayerGroup
  zoom: number
}

export default function CameraMarker({ cameraId, group, zoom }: CameraMarkerProps) {
  const camera = useCameraStore((s) => s.cameraRecords[cameraId]?.camera)
  const isSelected = useCameraLayerStore((s) => s.selectedCameraId === cameraId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const activeBaseMap = useBaseTileStore((s) => s.activeBaseMap)
  const isSelectMode = useMapActionsStore((s) => s.activeTool === 'select')

  useEffect(() => {
    if (!camera) return

    const marker = L.marker([camera.location.latitude, camera.location.longitude], {
      icon: buildCameraIcon(
        camera.color,
        isSelected,
        camera.bearing,
        camera.label,
        zoom,
        BASE_MAPS[activeBaseMap].labelTone,
      ),
      interactive: isSelectMode,
      draggable: isSelectMode,
    }).addTo(group)

    if (isSelectMode) {
      marker.on('click', (e: L.LeafletMouseEvent) => {
        e.originalEvent.stopPropagation()
        selectCamera(cameraId)
      })
    }

    // Drag end — write new position to store
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      const location = {
        latitude: lat,
        longitude: lng,
      }
      updateCamera(cameraId, {
        location,
        coverage_area: moveCoverageArea(camera.coverage_area, camera.location, location),
      })
    })

    return () => {
      marker.remove()
    }
  }, [activeBaseMap, camera, group, isSelectMode, isSelected, cameraId, selectCamera, updateCamera, zoom])

  return null
}
