import type { DrawingShape, DrawingStyle, MapDrawingBase } from '../types'

export const DEFAULT_DRAWING_STYLE: Readonly<DrawingStyle> = {
  stroke_color: '#3B82F6',
  stroke_width: 3,
  stroke_opacity: 1,
  line_style: 'solid',
  fill_color: '#3B82F6',
  fill_opacity: 0.16,
}

export function createLocalDrawing(
  shape: DrawingShape,
  createUid: () => string = () => crypto.randomUUID(),
): MapDrawingBase {
  return {
    uid: createUid(),
    label: '',
    purpose: 'annotation',
    shape,
    style: { ...DEFAULT_DRAWING_STYLE },
    visible: true,
    locked: false,
  }
}
