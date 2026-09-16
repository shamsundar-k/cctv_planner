import type { MapDrawingBase } from '../types'

export type DrawingSaveStatus = 'pending' | 'saving' | 'saved' | 'failed'

export interface DrawingTrackingEntry {
  isNew: boolean
  isDirty: boolean
  status: DrawingSaveStatus
  error: string | null
  revision: number
}

export interface DrawingRecord {
  drawing: MapDrawingBase
  tracking: DrawingTrackingEntry
}

export type MapDrawingPatch = Partial<Omit<MapDrawingBase, 'uid'>>

export interface MapDrawingStoreState {
  projectId: string | null
  selectedDrawingUid: string | null
  uids: string[]
  drawingRecords: Record<string, DrawingRecord>
  deletedDrawingUids: Set<string>
  isLoading: boolean
  loadError: string | null

  getDrawingsToCreate: () => DrawingRecord[]
  getDrawingsToUpdate: () => DrawingRecord[]
  getIsDirty: () => boolean

  loadDrawings: (projectId: string) => Promise<void>
  selectDrawing: (uid: string | null) => void
  clearSelection: () => void
  addDrawing: (drawing: MapDrawingBase) => boolean
  updateDrawing: (uid: string, patch: MapDrawingPatch) => void
  removeDrawing: (uid: string) => void
  saveAll: (projectId: string) => Promise<void>
  clear: () => void
}
