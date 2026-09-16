import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  createMapDrawing,
  deleteMapDrawing,
  listMapDrawings,
  updateMapDrawing,
} from '../api/mapDrawingApi'
import type {
  MapDrawingBase,
  MapDrawingCreate,
  MapDrawingResponse,
  MapDrawingUpdate,
} from '../types'
import type {
  DrawingRecord,
  MapDrawingStoreState,
} from './types'

function drawingData(drawing: MapDrawingBase): MapDrawingCreate {
  return {
    uid: drawing.uid,
    label: drawing.label,
    purpose: drawing.purpose,
    shape: drawing.shape,
    style: drawing.style,
    visible: drawing.visible,
    locked: drawing.locked,
  }
}

function updateData(drawing: MapDrawingBase): MapDrawingUpdate {
  return {
    label: drawing.label,
    purpose: drawing.purpose,
    shape: drawing.shape,
    style: drawing.style,
    visible: drawing.visible,
    locked: drawing.locked,
  }
}

function serverDrawing(drawing: MapDrawingResponse): MapDrawingBase {
  return drawingData(drawing)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}

function filterDirtyRecords(
  uids: string[],
  records: Record<string, DrawingRecord>,
  isNew: boolean,
): DrawingRecord[] {
  return uids
    .map((uid) => records[uid])
    .filter((record): record is DrawingRecord => (
      record != null
      && record.tracking.isNew === isNew
      && record.tracking.isDirty
      && record.tracking.status !== 'saving'
    ))
}

const emptyState = () => ({
  projectId: null,
  selectedDrawingUid: null,
  uids: [],
  drawingRecords: {},
  deletedDrawingUids: new Set<string>(),
  isLoading: false,
  loadError: null,
})

export const useMapDrawingStore = create<MapDrawingStoreState>()(
  devtools(
    (set, get) => ({
      ...emptyState(),

      getDrawingsToCreate: () => {
        const { uids, drawingRecords } = get()
        return filterDirtyRecords(uids, drawingRecords, true)
      },

      getDrawingsToUpdate: () => {
        const { uids, drawingRecords } = get()
        return filterDirtyRecords(uids, drawingRecords, false)
      },

      getIsDirty: () => {
        const { uids, drawingRecords, deletedDrawingUids } = get()
        return deletedDrawingUids.size > 0 || uids.some(
          (uid) => drawingRecords[uid]?.tracking.isDirty,
        )
      },

      loadDrawings: async (projectId) => {
        set({ ...emptyState(), projectId, isLoading: true })
        try {
          const drawings = await listMapDrawings(projectId)
          if (get().projectId !== projectId) return

          const drawingRecords: Record<string, DrawingRecord> = {}
          const uids: string[] = []
          for (const drawing of drawings) {
            uids.push(drawing.uid)
            drawingRecords[drawing.uid] = {
              drawing: serverDrawing(drawing),
              tracking: {
                isNew: false,
                isDirty: false,
                status: 'saved',
                error: null,
                revision: 0,
              },
            }
          }
          set({
            uids,
            drawingRecords,
            deletedDrawingUids: new Set(),
            isLoading: false,
            loadError: null,
          })
        } catch (error) {
          if (get().projectId !== projectId) return
          set({ isLoading: false, loadError: errorMessage(error) })
        }
      },

      selectDrawing: (uid) => {
        if (uid !== null && !get().drawingRecords[uid]) return
        set({ selectedDrawingUid: uid })
      },

      clearSelection: () => set({ selectedDrawingUid: null }),

      addDrawing: (drawing) => {
        if (!drawing.uid || get().drawingRecords[drawing.uid]) return false
        set((state) => ({
          uids: [...state.uids, drawing.uid],
          drawingRecords: {
            ...state.drawingRecords,
            [drawing.uid]: {
              drawing: drawingData(drawing),
              tracking: {
                isNew: true,
                isDirty: true,
                status: 'pending',
                error: null,
                revision: 0,
              },
            },
          },
        }))
        return true
      },

      updateDrawing: (uid, patch) => {
        set((state) => {
          const record = state.drawingRecords[uid]
          if (!record) return state
          return {
            drawingRecords: {
              ...state.drawingRecords,
              [uid]: {
                drawing: { ...record.drawing, ...patch },
                tracking: {
                  ...record.tracking,
                  isDirty: true,
                  status: record.tracking.status === 'saving' ? 'saving' : 'pending',
                  error: null,
                  revision: record.tracking.revision + 1,
                },
              },
            },
          }
        })
      },

      removeDrawing: (uid) => {
        set((state) => {
          const record = state.drawingRecords[uid]
          if (!record) return state

          const remainingRecords = { ...state.drawingRecords }
          delete remainingRecords[uid]
          const uids = state.uids.filter((drawingUid) => drawingUid !== uid)
          if (record.tracking.isNew && record.tracking.status !== 'saving') {
            return {
              uids,
              drawingRecords: remainingRecords,
              selectedDrawingUid: state.selectedDrawingUid === uid
                ? null
                : state.selectedDrawingUid,
            }
          }

          // A saved drawing needs DELETE. A new drawing already being POSTed
          // also needs DELETE if that in-flight create eventually succeeds.
          const deletedDrawingUids = new Set(state.deletedDrawingUids)
          deletedDrawingUids.add(uid)
          return {
            uids,
            drawingRecords: remainingRecords,
            deletedDrawingUids,
            selectedDrawingUid: state.selectedDrawingUid === uid
              ? null
              : state.selectedDrawingUid,
          }
        })
      },

      saveAll: async (projectId) => {
        if (get().projectId !== projectId) {
          throw new Error('Drawing state belongs to a different project')
        }

        const toCreate = get().getDrawingsToCreate().map((record) => ({
          uid: record.drawing.uid,
          drawing: drawingData(record.drawing),
          revision: record.tracking.revision,
        }))
        const toUpdate = get().getDrawingsToUpdate().map((record) => ({
          uid: record.drawing.uid,
          update: updateData(record.drawing),
          revision: record.tracking.revision,
        }))
        const toDelete = [...get().deletedDrawingUids]

        const markSaving = (uid: string) => set((state) => {
          if (state.projectId !== projectId) return state
          const record = state.drawingRecords[uid]
          if (!record) return state
          return {
            drawingRecords: {
              ...state.drawingRecords,
              [uid]: {
                ...record,
                tracking: { ...record.tracking, status: 'saving', error: null },
              },
            },
          }
        })
        for (const operation of [...toCreate, ...toUpdate]) markSaving(operation.uid)

        const markSaved = (
          uid: string,
          savedRevision: number,
          response: MapDrawingResponse,
        ) => set((state) => {
          if (state.projectId !== projectId) return state
          const record = state.drawingRecords[uid]
          if (!record) return state
          const hasNewerChanges = record.tracking.revision !== savedRevision
          return {
            drawingRecords: {
              ...state.drawingRecords,
              [uid]: {
                drawing: hasNewerChanges ? record.drawing : serverDrawing(response),
                tracking: {
                  ...record.tracking,
                  isNew: false,
                  isDirty: hasNewerChanges,
                  status: hasNewerChanges ? 'pending' : 'saved',
                  error: null,
                },
              },
            },
          }
        })

        const markFailed = (uid: string, error: unknown) => set((state) => {
          if (state.projectId !== projectId) return state
          const record = state.drawingRecords[uid]
          if (!record) return state
          return {
            drawingRecords: {
              ...state.drawingRecords,
              [uid]: {
                ...record,
                tracking: {
                  ...record.tracking,
                  isDirty: true,
                  status: 'failed',
                  error: errorMessage(error),
                },
              },
            },
          }
        })

        const results = await Promise.allSettled([
          ...toCreate.map(async ({ uid, drawing, revision }) => {
            try {
              const response = await createMapDrawing(projectId, drawing)
              markSaved(uid, revision, response)
            } catch (error) {
              set((state) => {
                if (state.projectId !== projectId || state.drawingRecords[uid]) {
                  return state
                }
                const deletedDrawingUids = new Set(state.deletedDrawingUids)
                deletedDrawingUids.delete(uid)
                return { deletedDrawingUids }
              })
              markFailed(uid, error)
              throw error
            }
          }),
          ...toUpdate.map(async ({ uid, update, revision }) => {
            try {
              const response = await updateMapDrawing(projectId, uid, update)
              markSaved(uid, revision, response)
            } catch (error) {
              markFailed(uid, error)
              throw error
            }
          }),
          ...toDelete.map(async (uid) => {
            await deleteMapDrawing(projectId, uid)
            set((state) => {
              if (state.projectId !== projectId) return state
              const deletedDrawingUids = new Set(state.deletedDrawingUids)
              deletedDrawingUids.delete(uid)
              return { deletedDrawingUids }
            })
          }),
        ])

        const failure = results.find((result) => result.status === 'rejected')
        if (failure?.status === 'rejected') throw failure.reason
      },

      clear: () => set(emptyState()),
    }),
    { name: 'MapDrawingStore' },
  ),
)
