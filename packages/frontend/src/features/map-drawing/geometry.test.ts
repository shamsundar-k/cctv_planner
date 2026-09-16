import { describe, expect, it } from 'vitest'
import { createLocalDrawing, DEFAULT_DRAWING_STYLE } from './utils/createLocalDrawing'
import {
  lineShapeFromPoints,
  polygonShapeFromRings,
  shapePositionsForLeaflet,
  toLatitudeLongitude,
  toPosition,
} from './utils/geometry'

describe('map drawing coordinate conversion', () => {
  it('converts between Leaflet and GeoJSON coordinate order', () => {
    expect(toPosition({ lat: 12.9716, lng: 77.5946 })).toEqual([77.5946, 12.9716])
    expect(toLatitudeLongitude([77.5946, 12.9716])).toEqual([12.9716, 77.5946])
  })

  it('creates a line only when at least two points are present', () => {
    expect(lineShapeFromPoints([{ lat: 12, lng: 77 }])).toBeNull()
    expect(lineShapeFromPoints([
      { lat: 12, lng: 77 },
      { lat: 13, lng: 78 },
    ])).toEqual({
      shape_type: 'line',
      geometry: {
        type: 'LineString',
        coordinates: [[77, 12], [78, 13]],
      },
    })
  })

  it('closes every polygon ring for backend validation', () => {
    const shape = polygonShapeFromRings([
      [
        { lat: 12, lng: 77 },
        { lat: 12, lng: 78 },
        { lat: 13, lng: 78 },
      ],
      [
        { lat: 12.2, lng: 77.2 },
        { lat: 12.2, lng: 77.3 },
        { lat: 12.3, lng: 77.3 },
      ],
    ])

    expect(shape?.geometry.coordinates).toEqual([
      [[77, 12], [78, 12], [78, 13], [77, 12]],
      [[77.2, 12.2], [77.3, 12.2], [77.3, 12.3], [77.2, 12.2]],
    ])
  })

  it('rejects empty polygons and rings with fewer than three corners', () => {
    expect(polygonShapeFromRings([])).toBeNull()
    expect(polygonShapeFromRings([[
      { lat: 12, lng: 77 },
      { lat: 13, lng: 78 },
    ]])).toBeNull()
  })

  it('removes GeoJSON closure positions when preparing Leaflet polygons', () => {
    const shape = polygonShapeFromRings([[
      { lat: 12, lng: 77 },
      { lat: 12, lng: 78 },
      { lat: 13, lng: 78 },
    ]])

    expect(shape && shapePositionsForLeaflet(shape)).toEqual([
      [[12, 77], [12, 78], [13, 78]],
    ])
  })
})

describe('local drawing creation', () => {
  it('creates an unspecialised annotation using backend-compatible defaults', () => {
    const shape = lineShapeFromPoints([
      { lat: 12, lng: 77 },
      { lat: 13, lng: 78 },
    ])
    if (!shape) throw new Error('Expected a valid line')

    const drawing = createLocalDrawing(shape, () => 'drawing-1')

    expect(drawing).toEqual({
      uid: 'drawing-1',
      label: '',
      purpose: 'annotation',
      shape,
      style: DEFAULT_DRAWING_STYLE,
      visible: true,
      locked: false,
    })
    expect(drawing.style).not.toBe(DEFAULT_DRAWING_STYLE)
  })
})
