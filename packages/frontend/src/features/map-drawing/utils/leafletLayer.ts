import L from 'leaflet'
import type { DrawingShape, DrawingStyle } from '../types'
import { shapePositionsForLeaflet } from './geometry'

function dashArray(lineStyle: DrawingStyle['line_style']): string | undefined {
  switch (lineStyle) {
    case 'dashed':
      return '8 6'
    case 'dotted':
      return '2 6'
    case 'solid':
      return undefined
  }
}

function pathOptions(
  style: DrawingStyle,
  selected: boolean,
  interactive: boolean,
): L.PathOptions {
  return {
    color: style.stroke_color,
    weight: style.stroke_width + (selected ? 2 : 0),
    opacity: style.stroke_opacity,
    dashArray: dashArray(style.line_style),
    fillColor: style.fill_color,
    fillOpacity: style.fill_opacity,
    interactive,
    pmIgnore: false,
  }
}

function markerIcon(style: DrawingStyle, selected: boolean): L.DivIcon {
  const size = Math.max(12, style.stroke_width * 2 + 8)
  const selectionRing = selected ? 'box-shadow:0 0 0 3px white,0 0 0 5px #2563EB;' : ''
  const rgba = (hex: string, opacity: number) => {
    const red = Number.parseInt(hex.slice(1, 3), 16)
    const green = Number.parseInt(hex.slice(3, 5), 16)
    const blue = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${red},${green},${blue},${opacity})`
  }
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${rgba(style.fill_color, style.fill_opacity)};border:${style.stroke_width}px solid ${rgba(style.stroke_color, style.stroke_opacity)};${selectionRing}"></span>`,
  })
}

export function createLeafletDrawingLayer(
  shape: DrawingShape,
  style: DrawingStyle,
  selected = false,
  interactive = false,
): L.Path | L.Marker {
  const options = pathOptions(style, selected, interactive)
  switch (shape.shape_type) {
    case 'line':
      return L.polyline(
        shapePositionsForLeaflet(shape) as [number, number][],
        options,
      )
    case 'polygon':
    case 'rectangle':
      return L.polygon(
        shapePositionsForLeaflet(shape) as [number, number][][],
        options,
      )
    case 'circle':
      return L.circle(
        shapePositionsForLeaflet(shape) as [number, number],
        { ...options, radius: shape.radius_metres },
      )
    case 'marker':
      return L.marker(
        shapePositionsForLeaflet(shape) as [number, number],
        {
          icon: markerIcon(style, selected),
          interactive,
          pmIgnore: false,
          keyboard: false,
        },
      )
  }
}
