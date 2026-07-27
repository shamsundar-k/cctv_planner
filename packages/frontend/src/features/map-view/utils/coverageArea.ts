import type { CoverageArea, GeoLocation } from '@/types/camera'

export function moveCoverageArea(
  coverageArea: CoverageArea | null | undefined,
  from: GeoLocation,
  to: GeoLocation,
): CoverageArea | null {
  if (!coverageArea) return null

  const latitudeDelta = to.latitude - from.latitude
  const longitudeDelta = to.longitude - from.longitude

  return {
    points: coverageArea.points.map((point) => ({
      latitude: point.latitude + latitudeDelta,
      longitude: point.longitude + longitudeDelta,
    })),
  }
}
