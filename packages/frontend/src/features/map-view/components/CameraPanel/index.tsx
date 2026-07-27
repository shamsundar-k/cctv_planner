import { useCameraPanel } from './useCameraPanel'
import PanelHeader from './PanelHeader'
import CameraDetailsSection from './CameraDetailsSection'
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
    fovMetrics,
    confirmDelete,
    setConfirmDelete,
    setField,
    handleDelete,
    parseNullableNumber,
    setTargetWidth,
    focalRange,
    targetWidthRange,
  } = useCameraPanel(projectId)

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-l border-panel-border bg-panel transition-[width] duration-200"
      style={{ width: selectedCameraId ? 380 : 0 }}
      aria-hidden={!selectedCameraId}
    >
      {selectedCameraId && form && camera && (
        <div className="flex h-full w-[380px] flex-col">
          <PanelHeader saveStatus={saveStatus} onClose={clearSelection} />
          <CameraDetailsSection camera={camera} model={cameraModel} metrics={fovMetrics} />
          <CameraForm form={form} setField={setField} parseNullableNumber={parseNullableNumber} setTargetWidth={setTargetWidth} focalRange={focalRange} targetWidthRange={targetWidthRange} />
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
