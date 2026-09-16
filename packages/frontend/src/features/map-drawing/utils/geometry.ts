import type {
  DrawingShape,
  LineShape,
  PolygonShape,
  Position,
} from '../types'

export interface LatitudeLongitude {
  lat: number
  lng: number
}

export function toPosition(point: LatitudeLongitude): Position {
  return [point.lng, point.lat]
}

export function toLatitudeLongitude(position: Position): [latitude: number, longitude: number] {
  return [position[1], position[0]]
}

export function lineShapeFromPoints(points: LatitudeLongitude[]): LineShape | null {
  if (points.length < 2) return null
  return {
    shape_type: 'line',
    geometry: {
      type: 'LineString',
      coordinates: points.map(toPosition),
    },
  }
}

function closeRing(points: LatitudeLongitude[]): Position[] {
  const positions = points.map(toPosition)
  const first = positions[0]
  const last = positions.at(-1)
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    positions.push([...first])
  }
  return positions
}

export function polygonShapeFromRings(
  rings: LatitudeLongitude[][],
): PolygonShape | null {
  if (rings.length === 0 || rings.some((ring) => ring.length < 3)) return null
  return {
    shape_type: 'polygon',
    geometry: {
      type: 'Polygon',
      coordinates: rings.map(closeRing),
    },
  }
}

export function shapePositionsForLeaflet(shape: DrawingShape):
  | [number, number]
  | [number, number][]
  | [number, number][][] {
  switch (shape.shape_type) {
    case 'marker':
    case 'circle':
      return toLatitudeLongitude(shape.geometry.coordinates)
    case 'line':
      return shape.geometry.coordinates.map(toLatitudeLongitude)
    case 'polygon':
    case 'rectangle':
      return shape.geometry.coordinates.map((ring) => {
        const positions = ring.length > 1
          && ring[0]?.[0] === ring.at(-1)?.[0]
          && ring[0]?.[1] === ring.at(-1)?.[1]
          ? ring.slice(0, -1)
          : ring
        return positions.map(toLatitudeLongitude)
      })
  }
}
