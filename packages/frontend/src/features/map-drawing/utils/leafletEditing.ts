import L from 'leaflet'
import type { DrawingShape } from '../types'
import {
  lineShapeFromPoints,
  polygonShapeFromRings,
  toPosition,
} from './geometry'

function flatLatLngs(layer: L.Polyline): L.LatLng[] | null {
  const latLngs = layer.getLatLngs()
  return latLngs.every((point) => point instanceof L.LatLng)
    ? latLngs
    : null
}

function polygonLatLngs(layer: L.Polygon): L.LatLng[][] | null {
  const latLngs = layer.getLatLngs()
  return latLngs.every(
    (ring) => Array.isArray(ring)
      && ring.every((point) => point instanceof L.LatLng),
  )
    ? latLngs as L.LatLng[][]
    : null
}

export function shapeFromEditedLayer(
  originalShape: DrawingShape,
  layer: L.Layer,
): DrawingShape | null {
  switch (originalShape.shape_type) {
    case 'line': {
      if (!(layer instanceof L.Polyline) || layer instanceof L.Polygon) return null
      const points = flatLatLngs(layer)
      return points ? lineShapeFromPoints(points) : null
    }
    case 'polygon':
    case 'rectangle': {
      if (!(layer instanceof L.Polygon)) return null
      const rings = polygonLatLngs(layer)
      const polygon = rings ? polygonShapeFromRings(rings) : null
      if (!polygon) return null
      return originalShape.shape_type === 'rectangle'
        ? { ...polygon, shape_type: 'rectangle' }
        : polygon
    }
    case 'circle':
      if (!(layer instanceof L.Circle)) return null
      return {
        shape_type: 'circle',
        geometry: { type: 'Point', coordinates: toPosition(layer.getLatLng()) },
        radius_metres: Math.min(100_000, Math.max(0.01, layer.getRadius())),
      }
    case 'marker':
      if (!(layer instanceof L.Marker)) return null
      return {
        shape_type: 'marker',
        geometry: { type: 'Point', coordinates: toPosition(layer.getLatLng()) },
      }
  }
}
