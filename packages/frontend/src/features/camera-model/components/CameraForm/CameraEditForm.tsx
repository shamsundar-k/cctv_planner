import type { CameraSpecForm, CameraSpecRecord } from '@/types/camera'
import IdentitySection from './IdentitySection'
import LensSection from './LensSection'
import SensorSection from './SensorSection'
import AdvancedSection from './AdvancedSection'
import FormActions from './FormActions'
import CameraImageSection from './CameraImageSection'
import type { CameraImageInputState } from '../../hooks/useCameraImageInput'

interface Props {
  form: CameraSpecForm
  setForm: React.Dispatch<React.SetStateAction<CameraSpecForm>>
  errors: Record<string, string>
  set: <K extends keyof CameraSpecForm>(key: K, value: CameraSpecForm[K]) => void
  handleLensTypeChange: (lt: CameraSpecForm['lens_type']) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  isFixed: boolean
  camera?: CameraSpecRecord
  image: CameraImageInputState
}

export default function CameraEditForm({
  form,
  setForm,
  errors,
  set,
  handleLensTypeChange,
  handleSubmit,
  isPending,
  isFixed,
  camera,
  image,
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <IdentitySection form={form} errors={errors} set={set} />
      <CameraImageSection camera={camera} image={image} />
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
      />
      <AdvancedSection form={form} errors={errors} set={set} />
      <FormActions isPending={isPending} submitLabel="Save Changes" />
    </form>
  )
}
