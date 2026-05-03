import { useEffect, useRef, type RefObject } from 'react'
import L from 'leaflet'
import { useCameraStore } from '@/store/cameraStore'
import { useLayerVisibilityStore } from '@/store/layerVisibilityStore'

interface FovPolygonProps {
  cameraId: string
  layerRef: RefObject<L.LayerGroup | null>
}

interface GeoRef {
  lat: number
  lng: number
  bearing: number
  fovGeo: object | null
  irGeo: object | null
}

function cornersToLatLngs(geojson: object | null): Array<[number, number]> | null {
  if (!geojson || !Array.isArray(geojson) || geojson.length !== 4) return null
  const corners = geojson as Array<{ lat: number; lng: number }>
  if (!corners.every(c => typeof c?.lat === 'number' && typeof c?.lng === 'number')) return null
  return corners.map(c => [c.lat, c.lng])
}

function rotatePoint(
  lat: number, lng: number,
  centerLat: number, centerLng: number,
  angleDeg: number,
): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  const cosLat = Math.cos((centerLat * Math.PI) / 180)
  const dx = (lng - centerLng) * cosLat
  const dy = lat - centerLat
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return [
    centerLat + (dy * cos - dx * sin),
    centerLng + (dx * cos + dy * sin) / cosLat,
  ]
}

// Translate corners by a position delta, then rotate around the new camera center
function transformCorners(
  base: Array<[number, number]>,
  dLat: number, dLng: number,
  centerLat: number, centerLng: number,
  dBearing: number,
): L.LatLngExpression[] {
  const translated = base.map(([lat, lng]): [number, number] => [lat + dLat, lng + dLng])
  if (dBearing === 0) return translated
  return translated.map(([lat, lng]) => rotatePoint(lat, lng, centerLat, centerLng, dBearing))
}

export default function FovPolygon({ cameraId, layerRef }: FovPolygonProps) {
  const camera = useCameraStore((s) => s.cameraRecords[cameraId]?.camera)
  const visible = useLayerVisibilityStore((s) => s.visible)

  // Snapshot of camera state when the server last computed the geojson
  const geoRef = useRef<GeoRef>({ lat: 0, lng: 0, bearing: 0, fovGeo: null, irGeo: null })

  useEffect(() => {
    const group = layerRef.current
    if (!group || !camera) return

    // Geojson object identity changes when the server recomputes it — reset the reference snapshot
    if (camera.fov_visible_geojson !== geoRef.current.fovGeo || camera.fov_ir_geojson !== geoRef.current.irGeo) {
      geoRef.current = {
        lat: camera.lat,
        lng: camera.lng,
        bearing: camera.bearing,
        fovGeo: camera.fov_visible_geojson,
        irGeo: camera.fov_ir_geojson,
      }
    }

    const { lat: refLat, lng: refLng, bearing: refBearing } = geoRef.current
    const dLat = camera.lat - refLat
    const dLng = camera.lng - refLng
    const dBearing = camera.bearing - refBearing

    const fovPoly = L.polygon([], { weight: 1.5, opacity: 0.7, fillOpacity: 0.18 })
    const irPoly = L.polygon([], { weight: 1.5, opacity: 0.55, fillOpacity: 0.07, dashArray: '5 5' })

    const fovBase = cornersToLatLngs(camera.fov_visible_geojson)
    const fovLatLngs = fovBase ? transformCorners(fovBase, dLat, dLng, camera.lat, camera.lng, dBearing) : null
    fovPoly.setLatLngs(fovLatLngs ?? [])
    fovPoly.setStyle({ color: camera.colour, fillColor: camera.colour })
    if (camera.visible && visible.fov && fovLatLngs) fovPoly.addTo(group)

    const irBase = cornersToLatLngs(camera.fov_ir_geojson)
    const irLatLngs = irBase ? transformCorners(irBase, dLat, dLng, camera.lat, camera.lng, dBearing) : null
    irPoly.setLatLngs(irLatLngs ?? [])
    irPoly.setStyle({ color: camera.colour, fillColor: camera.colour })
    if (camera.visible && visible.ir && irLatLngs) irPoly.addTo(group)

    return () => {
      fovPoly.remove()
      irPoly.remove()
    }
  }, [camera, visible])

  return null
}
