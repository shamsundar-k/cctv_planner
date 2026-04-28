export type ZoneType = 'coverage_area' | 'exclusion' | 'annotation'

export interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export interface GeoJsonLineString {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface Zone {
  id: string
  label: string
  zone_type: ZoneType
  colour: string
  visible: boolean
  geojson: GeoJsonPolygon | GeoJsonLineString
}

export interface ZoneCreatePayload {
  label: string
  zone_type: ZoneType
  colour: string
  geojson: GeoJsonPolygon | GeoJsonLineString
}
