import { beforeEach, describe, expect, it, vi } from 'vitest'
import client from '@/api/client'
import {
  createMapDrawing,
  deleteMapDrawing,
  listMapDrawings,
  updateMapDrawing,
} from './api/mapDrawingApi'
import { useMapDrawingStore } from './store/store'
import type {
  MapDrawingBase,
  MapDrawingResponse,
  MapDrawingUpdate,
} from './types'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function drawing(uid: string, label = 'Entrance'): MapDrawingBase {
  return {
    uid,
    label,
    purpose: 'annotation',
    shape: {
      shape_type: 'marker',
      geometry: { type: 'Point', coordinates: [77.5946, 12.9716] },
    },
    style: {
      stroke_color: '#3B82F6',
      stroke_width: 3,
      stroke_opacity: 1,
      line_style: 'solid',
      fill_color: '#3B82F6',
      fill_opacity: 0.16,
    },
    visible: true,
    locked: false,
  }
}

function response(uid: string, label = 'Entrance'): MapDrawingResponse {
  return {
    ...drawing(uid, label),
    created_at: '2026-09-16T08:00:00Z',
    updated_at: '2026-09-16T08:00:00Z',
  }
}

function axiosResponse<T>(data: T): { data: T } {
  return { data }
}

beforeEach(() => {
  vi.clearAllMocks()
  useMapDrawingStore.getState().clear()
})

describe('map drawing API', () => {
  it('uses encoded project and drawing identifiers for every operation', async () => {
    const projectId = 'project/one'
    const uid = 'drawing/one'
    const createPayload = drawing(uid)
    const updatePayload: MapDrawingUpdate = { label: 'Updated' }
    vi.mocked(client.get).mockResolvedValue(axiosResponse([response(uid)]) as never)
    vi.mocked(client.post).mockResolvedValue(axiosResponse(response(uid)) as never)
    vi.mocked(client.patch).mockResolvedValue(
      axiosResponse(response(uid, 'Updated')) as never,
    )
    vi.mocked(client.delete).mockResolvedValue({} as never)

    await listMapDrawings(projectId)
    await createMapDrawing(projectId, createPayload)
    await updateMapDrawing(projectId, uid, updatePayload)
    await deleteMapDrawing(projectId, uid)

    const collectionPath = '/projects/project%2Fone/drawings'
    expect(client.get).toHaveBeenCalledWith(collectionPath)
    expect(client.post).toHaveBeenCalledWith(collectionPath, createPayload)
    expect(client.patch).toHaveBeenCalledWith(
      `${collectionPath}/drawing%2Fone`,
      updatePayload,
    )
    expect(client.delete).toHaveBeenCalledWith(`${collectionPath}/drawing%2Fone`)
  })
})

describe('map drawing store', () => {
  it('loads server drawings as clean records', async () => {
    vi.mocked(client.get).mockResolvedValue(
      axiosResponse([response('drawing-1'), response('drawing-2')]) as never,
    )

    await useMapDrawingStore.getState().loadDrawings('project-1')

    const state = useMapDrawingStore.getState()
    expect(state.projectId).toBe('project-1')
    expect(state.uids).toEqual(['drawing-1', 'drawing-2'])
    expect(state.drawingRecords['drawing-1']?.tracking).toEqual({
      isNew: false,
      isDirty: false,
      status: 'saved',
      error: null,
      revision: 0,
    })
    expect(state.getIsDirty()).toBe(false)
  })

  it('tracks local additions, updates, and removals', () => {
    useMapDrawingStore.setState({ projectId: 'project-1' })

    expect(useMapDrawingStore.getState().addDrawing(drawing('drawing-1'))).toBe(true)
    expect(useMapDrawingStore.getState().addDrawing(drawing('drawing-1'))).toBe(false)
    useMapDrawingStore.getState().selectDrawing('drawing-1')
    expect(useMapDrawingStore.getState().selectedDrawingUid).toBe('drawing-1')
    useMapDrawingStore.getState().updateDrawing('drawing-1', { label: 'Updated' })

    const record = useMapDrawingStore.getState().drawingRecords['drawing-1']
    expect(record?.drawing.label).toBe('Updated')
    expect(record?.tracking.revision).toBe(1)
    expect(useMapDrawingStore.getState().getDrawingsToCreate()).toHaveLength(1)

    useMapDrawingStore.getState().removeDrawing('drawing-1')
    expect(useMapDrawingStore.getState().uids).toEqual([])
    expect(useMapDrawingStore.getState().selectedDrawingUid).toBeNull()
    expect(useMapDrawingStore.getState().deletedDrawingUids.size).toBe(0)
    expect(useMapDrawingStore.getState().getIsDirty()).toBe(false)
  })

  it('does not select an unknown drawing', () => {
    useMapDrawingStore.getState().selectDrawing('missing')

    expect(useMapDrawingStore.getState().selectedDrawingUid).toBeNull()
  })

  it('queues deletion only for a drawing that exists on the server', async () => {
    vi.mocked(client.get).mockResolvedValue(
      axiosResponse([response('saved-drawing')]) as never,
    )
    await useMapDrawingStore.getState().loadDrawings('project-1')

    useMapDrawingStore.getState().removeDrawing('saved-drawing')

    expect(useMapDrawingStore.getState().deletedDrawingUids).toEqual(
      new Set(['saved-drawing']),
    )
    expect(useMapDrawingStore.getState().getIsDirty()).toBe(true)
  })

  it('creates, updates, and deletes dirty records in one save cycle', async () => {
    vi.mocked(client.get).mockResolvedValue(
      axiosResponse([response('to-update'), response('to-delete')]) as never,
    )
    await useMapDrawingStore.getState().loadDrawings('project-1')
    useMapDrawingStore.getState().addDrawing(drawing('to-create'))
    useMapDrawingStore.getState().updateDrawing('to-update', { label: 'Updated' })
    useMapDrawingStore.getState().removeDrawing('to-delete')

    vi.mocked(client.post).mockResolvedValue(
      axiosResponse(response('to-create')) as never,
    )
    vi.mocked(client.patch).mockResolvedValue(
      axiosResponse(response('to-update', 'Updated')) as never,
    )
    vi.mocked(client.delete).mockResolvedValue({} as never)

    await useMapDrawingStore.getState().saveAll('project-1')

    expect(client.post).toHaveBeenCalledOnce()
    expect(client.patch).toHaveBeenCalledOnce()
    expect(client.delete).toHaveBeenCalledOnce()
    expect(useMapDrawingStore.getState().getIsDirty()).toBe(false)
    expect(useMapDrawingStore.getState().drawingRecords['to-create']?.tracking.isNew)
      .toBe(false)
  })

  it('retains failed updates and deletes for retry', async () => {
    vi.mocked(client.get).mockResolvedValue(
      axiosResponse([response('to-update'), response('to-delete')]) as never,
    )
    await useMapDrawingStore.getState().loadDrawings('project-1')
    useMapDrawingStore.getState().updateDrawing('to-update', { label: 'Updated' })
    useMapDrawingStore.getState().removeDrawing('to-delete')
    vi.mocked(client.patch).mockRejectedValue(new Error('update failed'))
    vi.mocked(client.delete).mockRejectedValue(new Error('delete failed'))

    await expect(useMapDrawingStore.getState().saveAll('project-1')).rejects.toThrow()

    const state = useMapDrawingStore.getState()
    expect(state.drawingRecords['to-update']?.tracking.status).toBe('failed')
    expect(state.drawingRecords['to-update']?.tracking.isDirty).toBe(true)
    expect(state.deletedDrawingUids).toEqual(new Set(['to-delete']))
  })

  it('preserves a newer local edit when an in-flight create succeeds', async () => {
    useMapDrawingStore.setState({ projectId: 'project-1' })
    useMapDrawingStore.getState().addDrawing(drawing('drawing-1'))

    let resolveCreate: ((value: { data: MapDrawingResponse }) => void) | undefined
    vi.mocked(client.post).mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve
    }) as never)

    const saving = useMapDrawingStore.getState().saveAll('project-1')
    useMapDrawingStore.getState().updateDrawing('drawing-1', { label: 'Newer edit' })
    resolveCreate?.(axiosResponse(response('drawing-1')))
    await saving

    const record = useMapDrawingStore.getState().drawingRecords['drawing-1']
    expect(record?.drawing.label).toBe('Newer edit')
    expect(record?.tracking).toMatchObject({
      isNew: false,
      isDirty: true,
      status: 'pending',
      revision: 1,
    })
    expect(useMapDrawingStore.getState().getDrawingsToUpdate()).toHaveLength(1)
  })

  it('queues cleanup when a drawing is removed during its create request', async () => {
    useMapDrawingStore.setState({ projectId: 'project-1' })
    useMapDrawingStore.getState().addDrawing(drawing('drawing-1'))
    let resolveCreate: ((value: { data: MapDrawingResponse }) => void) | undefined
    vi.mocked(client.post).mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve
    }) as never)

    const saving = useMapDrawingStore.getState().saveAll('project-1')
    useMapDrawingStore.getState().removeDrawing('drawing-1')
    resolveCreate?.(axiosResponse(response('drawing-1')))
    await saving

    expect(useMapDrawingStore.getState().drawingRecords['drawing-1']).toBeUndefined()
    expect(useMapDrawingStore.getState().deletedDrawingUids).toEqual(
      new Set(['drawing-1']),
    )
  })

  it('does not apply a completed save to a newly loaded project', async () => {
    useMapDrawingStore.setState({ projectId: 'project-1' })
    useMapDrawingStore.getState().addDrawing(drawing('shared-uid'))
    let resolveCreate: ((value: { data: MapDrawingResponse }) => void) | undefined
    vi.mocked(client.post).mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve
    }) as never)

    const saving = useMapDrawingStore.getState().saveAll('project-1')
    useMapDrawingStore.setState({
      projectId: 'project-2',
      uids: ['shared-uid'],
      drawingRecords: {
        'shared-uid': {
          drawing: drawing('shared-uid', 'Project 2 drawing'),
          tracking: {
            isNew: false,
            isDirty: false,
            status: 'saved',
            error: null,
            revision: 0,
          },
        },
      },
    })
    resolveCreate?.(axiosResponse(response('shared-uid')))
    await saving

    const state = useMapDrawingStore.getState()
    expect(state.projectId).toBe('project-2')
    expect(state.drawingRecords['shared-uid']?.drawing.label).toBe('Project 2 drawing')
  })

  it('rejects saving state loaded for a different project', async () => {
    useMapDrawingStore.setState({ projectId: 'project-1' })

    await expect(useMapDrawingStore.getState().saveAll('project-2')).rejects.toThrow(
      'different project',
    )
  })
})
