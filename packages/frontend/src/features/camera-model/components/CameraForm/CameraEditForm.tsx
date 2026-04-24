import type { CameraModelCreate } from '../../../../types/cameramodel.types'
import IdentitySection from './IdentitySection'
import LensSection from './LensSection'
import SensorSection from './SensorSection'
import AdvancedSection from './AdvancedSection'
import FormActions from './FormActions'

interface Props {
  form: CameraModelCreate
  setForm: React.Dispatch<React.SetStateAction<CameraModelCreate>>
  errors: Record<string, string>
  sensorIsCustom: boolean
  setSensorIsCustom: (v: boolean) => void
  set: <K extends keyof CameraModelCreate>(key: K, value: CameraModelCreate[K]) => void
  handleLensTypeChange: (lt: CameraModelCreate['lens_type']) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  isFixed: boolean
}

export default function CameraEditForm({
  form,
  setForm,
  errors,
  sensorIsCustom,
  setSensorIsCustom,
  set,
  handleLensTypeChange,
  handleSubmit,
  isPending,
  isFixed,
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <IdentitySection form={form} errors={errors} set={set} />
      <LensSection
        form={form}
        errors={errors}
        set={set}
        setForm={setForm}
        handleLensTypeChange={handleLensTypeChange}
        isFixed={isFixed}
      />
      <SensorSection
        form={form}
        errors={errors}
        set={set}
        sensorIsCustom={sensorIsCustom}
        setSensorIsCustom={setSensorIsCustom}
      />
      <AdvancedSection form={form} set={set} />
      <FormActions isPending={isPending} submitLabel="Save Changes" />
    </form>
  )
}
