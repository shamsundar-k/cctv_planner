import { useCameraPanel } from './useCameraPanel'
import PanelHeader from './PanelHeader'
import CameraInfoSection from './CameraInfoSection'
import DoriMetricsSection from './DoriMetricsSection'
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
  } = useCameraPanel(projectId)

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-l border-panel-border bg-panel transition-[width] duration-200"
      style={{ width: selectedCameraId ? 312 : 0 }}
      aria-hidden={!selectedCameraId}
    >
      {selectedCameraId && form && camera && (
        <div className="flex h-full w-[312px] flex-col">
          <PanelHeader saveStatus={saveStatus} onClose={clearSelection} />
          <CameraInfoSection
            modelName={cameraModel?.name ?? '-'}
            lat={camera.location.latitude}
            lng={camera.location.longitude}
          />
          <DoriMetricsSection metrics={fovMetrics} />
          <CameraForm form={form} setField={setField} parseNullableNumber={parseNullableNumber} />
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
