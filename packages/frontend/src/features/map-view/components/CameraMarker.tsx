import { useEffect, type RefObject } from 'react'
import L from 'leaflet'
import { useCameraStore } from '@/store/cameraStore'
import { useCameraLayerStore } from '@/store/cameraLayerSlice'

function buildCameraIcon(colour: string, selected: boolean, bearing: number): L.DivIcon {
  const selectionRing = selected
    ? `<circle cx="16" cy="24" r="14" fill="none" stroke="white" stroke-width="2.5"/>`
    : ''
  const html = `
    <div style="width:32px;height:40px;transform:rotate(${bearing}deg);transform-origin:16px 24px;">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <polygon points="16,2 11,14 21,14" fill="${colour}"/>
        ${selectionRing}
        <circle cx="16" cy="24" r="13" fill="${colour}"/>
        <g transform="translate(8.5,18)">
          <rect x="0" y="2" width="10" height="7" rx="1.5" stroke="white" stroke-width="1.5"/>
          <path d="M10 4l3.5-2v7L10 7V4z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="5" cy="5.5" r="1.5" stroke="white" stroke-width="1.5"/>
        </g>
      </svg>
    </div>
  `
  return L.divIcon({ html, className: '', iconSize: [32, 40], iconAnchor: [16, 24] })
}

interface CameraMarkerProps {
  cameraId: string
  groupRef: RefObject<L.LayerGroup | null>
}

export default function CameraMarker({ cameraId, groupRef }: CameraMarkerProps) {
  const camera = useCameraInstanceStore((s) => s.cameraRecords[cameraId]?.camera)
  const isSelected = useCameraLayerStore((s) => s.selectedCameraId === cameraId)
  const selectCamera = useCameraLayerStore((s) => s.selectCamera)
  const updateCamera = useCameraStore((s) => s.updateCamera)

  useEffect(() => {
    const group = groupRef.current
<<<<<<< Updated upstream:packages/frontend/src/features/map-view/components/CameraMarker.tsx
    const camera = useCameraStore.getState().cameraRecords[cameraId]?.camera
=======
>>>>>>> Stashed changes:packages/frontend/src/features/map-view/components/map/CameraMarker.tsx
    if (!group || !camera) return

    const marker = L.marker([camera.lat, camera.lng], {
      icon: buildCameraIcon(camera.colour, isSelected, camera.bearing),
      draggable: true,
    }).addTo(group)

    // Click — always select, no toggle
    marker.on('click', (e: L.LeafletMouseEvent) => {
      e.originalEvent.stopPropagation()
      selectCamera(cameraId)
    })

    // Drag end — write new position to store
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      updateCamera(cameraId, { lat, lng })
    })

<<<<<<< Updated upstream:packages/frontend/src/features/map-view/components/CameraMarker.tsx
    // Selection change — update icon imperatively, no re-render
    const unsubSelection = useCameraLayerStore.subscribe(
      (s) => s.selectedCameraId,
      (selectedId) => {
        const cam = useCameraStore.getState().cameraRecords[cameraId]?.camera
        if (cam) marker.setIcon(buildCameraIcon(cam.colour, selectedId === cameraId, cam.bearing))
      }
    )

    // Camera data change — update icon and position imperatively
    const unsubCamera = useCameraStore.subscribe(
      (s) => s.cameraRecords[cameraId]?.camera,
      (cam) => {
        if (!cam) return
        const selected = useCameraLayerStore.getState().selectedCameraId === cameraId
        marker.setIcon(buildCameraIcon(cam.colour, selected, cam.bearing))
        marker.setLatLng([cam.lat, cam.lng])
      }
    )
=======

>>>>>>> Stashed changes:packages/frontend/src/features/map-view/components/map/CameraMarker.tsx

    return () => {
      marker.remove()
    }
  }, [camera, isSelected, cameraId, selectCamera, updateCamera])

  return null
}
