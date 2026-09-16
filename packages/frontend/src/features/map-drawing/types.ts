/** A GeoJSON position in [longitude, latitude] order. */
export type Position = [longitude: number, latitude: number]

export interface PointGeometry {
  type: 'Point'
  coordinates: Position
}

export interface LineStringGeometry {
  type: 'LineString'
  coordinates: Position[]
}

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface LineShape {
  shape_type: 'line'
  geometry: LineStringGeometry
}

export interface PolygonShape {
  shape_type: 'polygon'
  geometry: PolygonGeometry
}

export interface RectangleShape {
  shape_type: 'rectangle'
  geometry: PolygonGeometry
}

export interface CircleShape {
  shape_type: 'circle'
  geometry: PointGeometry
  radius_metres: number
}

export interface MarkerShape {
  shape_type: 'marker'
  geometry: PointGeometry
}

export type DrawingShape =
  | LineShape
  | PolygonShape
  | RectangleShape
  | CircleShape
  | MarkerShape

export type DrawingPurpose =
  | 'annotation'
  | 'coverage_zone'
  | 'exclusion_zone'
  | 'site_boundary'

export type DrawingLineStyle = 'solid' | 'dashed' | 'dotted'

export interface DrawingStyle {
  stroke_color: string
  stroke_width: number
  stroke_opacity: number
  line_style: DrawingLineStyle
  fill_color: string
  fill_opacity: number
}

export interface MapDrawingBase {
  uid: string
  label: string
  purpose: DrawingPurpose
  shape: DrawingShape
  style: DrawingStyle
  visible: boolean
  locked: boolean
}

export type MapDrawingCreate = MapDrawingBase

export interface MapDrawingUpdate {
  label?: string | null
  purpose?: DrawingPurpose | null
  shape?: DrawingShape | null
  style?: DrawingStyle | null
  visible?: boolean | null
  locked?: boolean | null
}

export interface MapDrawingResponse extends MapDrawingBase {
  created_at: string
  updated_at: string
}
