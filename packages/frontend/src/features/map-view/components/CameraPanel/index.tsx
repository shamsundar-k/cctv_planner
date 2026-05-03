import { useCameraPanel } from './useCameraPanel'
import PanelHeader from './PanelHeader'
import CameraInfoSection from './CameraInfoSection'
import CameraForm from './CameraForm'
import PanelFooter from './PanelFooter'

interface CameraPanelProps {
  projectId: string
}

export default function CameraPanel({ projectId }: CameraPanelProps) {
  const {
    selectedCameraId,
    clearSelection,
    camera,
    cameraModel,
    saveStatus,
    form,
    confirmDelete,
    setConfirmDelete,
    setField,
    handleDelete,
    parseNullableNumber,
  } = useCameraPanel(projectId)

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden transition-[width] duration-200"
      style={{
        width: selectedCameraId ? 312 : 0,
        background: 'var(--theme-bg-card)',
        borderLeft: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)',
      }}
      aria-hidden={!selectedCameraId}
    >
      {selectedCameraId && form && camera && (
        <div className="flex flex-col h-full w-[312px]">
          <PanelHeader saveStatus={saveStatus} onClose={clearSelection} />
          <CameraInfoSection modelName={cameraModel?.name ?? '—'} lat={camera.lat} lng={camera.lng} />
          <CameraForm form={form} setField={setField} cameraModel={cameraModel} parseNullableNumber={parseNullableNumber} />
          <PanelFooter
            confirmDelete={confirmDelete}
            onRequestDelete={() => setConfirmDelete(true)}
            onConfirmDelete={handleDelete}
            onCancelDelete={() => setConfirmDelete(false)}
          />
        </div>
      )}
    </aside>
  )
}
