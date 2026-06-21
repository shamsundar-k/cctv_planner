import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import * as THREE from 'three'
import { ChevronLeft } from 'lucide-react'
import CollapsibleSection from '@/components/ui/CollapsibleSection'
import FormField from '@/components/ui/FormField'
import InputWithUnit from '@/components/ui/InputWithUnit'
import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'
import type { CameraSpecRecord } from '@/types/camera'

interface InstallationDetails {
  height: number
  focalLength: number
  targetDistance: number
}

const inputClass =
  'w-full rounded-lg border border-surface/30 bg-surface/20 px-3 py-2 pr-10 text-sm text-primary outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/30'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function interpolateByFocalLength(model: CameraSpecRecord, focalLength: number, fov: 'h_fov' | 'v_fov') {
  const focal = model.lens_spec.focal_length
  if (focal.min === focal.max) return model.lens_spec[fov].max

  const ratio = clamp((focalLength - focal.min) / (focal.max - focal.min), 0, 1)
  const wideFov = model.lens_spec[fov].max
  const teleFov = model.lens_spec[fov].min
  return wideFov + (teleFov - wideFov) * ratio
}

function NumberInput({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  unit: string
  min: number
  max?: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <FormField label={label}>
      <InputWithUnit unit={unit}>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={inputClass}
        />
      </InputWithUnit>
    </FormField>
  )
}

function FovScene({
  selectedModel,
  details,
  hFov,
  vFov,
}: {
  selectedModel: CameraSpecRecord | null
  details: InstallationDetails
  hFov: number
  vFov: number
}) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000)
    camera.position.set(16, 11, -18)
    camera.lookAt(0, 1.8, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const grid = new THREE.GridHelper(40, 40, 0x334155, 0x1f2937)
    scene.add(grid)
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
    directionalLight.position.set(6, 12, -8)
    scene.add(directionalLight)

    const cameraPosition = new THREE.Vector3(0, details.height, 0)
    const targetPosition = new THREE.Vector3(0, 0, details.targetDistance)
    const forward = new THREE.Vector3().subVectors(targetPosition, cameraPosition).normalize()
    const right = new THREE.Vector3(1, 0, 0)
    const up = new THREE.Vector3().crossVectors(right, forward).normalize()
    const range = cameraPosition.distanceTo(targetPosition)
    const width = 2 * range * Math.tan(THREE.MathUtils.degToRad(hFov) / 2)
    const height = 2 * range * Math.tan(THREE.MathUtils.degToRad(vFov) / 2)

    const corners = [
      targetPosition.clone().add(right.clone().multiplyScalar(-width / 2)).add(up.clone().multiplyScalar(height / 2)),
      targetPosition.clone().add(right.clone().multiplyScalar(width / 2)).add(up.clone().multiplyScalar(height / 2)),
      targetPosition.clone().add(right.clone().multiplyScalar(width / 2)).add(up.clone().multiplyScalar(-height / 2)),
      targetPosition.clone().add(right.clone().multiplyScalar(-width / 2)).add(up.clone().multiplyScalar(-height / 2)),
    ]

    const fovGeometry = new THREE.BufferGeometry().setFromPoints([
      cameraPosition, corners[0], corners[1],
      cameraPosition, corners[1], corners[2],
      cameraPosition, corners[2], corners[3],
      cameraPosition, corners[3], corners[0],
      corners[0], corners[1], corners[2],
      corners[0], corners[2], corners[3],
    ])
    fovGeometry.setIndex([...Array(18).keys()])

    const fovMesh = new THREE.Mesh(
      fovGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      }),
    )
    scene.add(fovMesh)

    const edgeGeometry = new THREE.BufferGeometry().setFromPoints([
      cameraPosition, corners[0],
      cameraPosition, corners[1],
      cameraPosition, corners[2],
      cameraPosition, corners[3],
      corners[0], corners[1],
      corners[1], corners[2],
      corners[2], corners[3],
      corners[3], corners[0],
    ])
    scene.add(new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: 0x67e8f9 })))

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.75, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 }),
    )
    body.position.copy(cameraPosition)
    body.lookAt(targetPosition)
    scene.add(body)

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, details.height, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }),
    )
    pole.position.set(0, details.height / 2, 0)
    scene.add(pole)

    const targetMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 0.75, 32),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }),
    )
    targetMarker.rotation.x = -Math.PI / 2
    targetMarker.position.copy(targetPosition).add(new THREE.Vector3(0, 0.01, 0))
    scene.add(targetMarker)

    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 512
    labelCanvas.height = 128
    const context = labelCanvas.getContext('2d')
    if (context) {
      context.fillStyle = 'rgba(15, 23, 42, 0.9)'
      context.fillRect(0, 0, labelCanvas.width, labelCanvas.height)
      context.fillStyle = '#e2e8f0'
      context.font = '28px sans-serif'
      context.fillText(selectedModel ? selectedModel.name : 'No camera model selected', 24, 48)
      context.fillStyle = '#94a3b8'
      context.font = '22px sans-serif'
      context.fillText(`H ${hFov.toFixed(1)} deg / V ${vFov.toFixed(1)} deg`, 24, 88)
    }
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas), transparent: true }),
    )
    label.position.set(0, details.height + 1.4, 0)
    label.scale.set(5.5, 1.4, 1)
    scene.add(label)

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    let animationId = 0
    const render = () => {
      animationId = window.requestAnimationFrame(render)
      scene.rotation.y += 0.0015
      renderer.render(scene, camera)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationId)
      observer.disconnect()
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      fovGeometry.dispose()
      edgeGeometry.dispose()
    }
  }, [details.height, details.targetDistance, hFov, selectedModel, vFov])

  return <div ref={mountRef} className="h-full min-h-[420px] w-full overflow-hidden rounded-xl border border-surface/30" />
}

export default function ThreeDFovVisualiserPage() {
  const { data: models = [], isLoading } = useAllCameraSpecs()
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')
  const [details, setDetails] = useState<InstallationDetails>({
    height: 3,
    focalLength: 4,
    targetDistance: 12,
  })

  const manufacturers = useMemo(
    () => Array.from(new Set(models.map((model) => model.manufacturer))).sort(),
    [models],
  )
  const filteredModels = useMemo(
    () => selectedManufacturer ? models.filter((model) => model.manufacturer === selectedManufacturer) : models,
    [models, selectedManufacturer],
  )
  const selectedModel = models.find((model) => model.id === selectedModelId) ?? null
  const focalRange = selectedModel?.lens_spec.focal_length

  const focalLength = focalRange
    ? clamp(details.focalLength, focalRange.min, focalRange.max)
    : details.focalLength
  const hFov = selectedModel ? interpolateByFocalLength(selectedModel, focalLength, 'h_fov') : 68
  const vFov = selectedModel ? interpolateByFocalLength(selectedModel, focalLength, 'v_fov') : 38

  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40 text-primary">
      <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-8 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover">
              <ChevronLeft size={16} />
              Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">3D fov visualiser</h1>
          </div>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex min-h-[680px] flex-col gap-4 rounded-xl border border-surface/30 bg-card/95 p-4 shadow-xl">
            <div className="flex-1">
              <CollapsibleSection title="Camera model" defaultOpen>
                <div className="flex flex-col gap-4">
                  <FormField label="Manufacturer">
                    <select
                      value={selectedManufacturer}
                      onChange={(event) => {
                        setSelectedManufacturer(event.target.value)
                        setSelectedModelId('')
                      }}
                      className={inputClass}
                    >
                      <option value="" className="bg-card text-primary">All manufacturers</option>
                      {manufacturers.map((manufacturer) => (
                        <option key={manufacturer} value={manufacturer} className="bg-card text-primary">
                          {manufacturer}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Model" hint={isLoading ? 'Loading camera models...' : undefined}>
                    <select
                      value={selectedModelId}
                      disabled={isLoading || filteredModels.length === 0}
                      onChange={(event) => {
                        const nextModel = models.find((model) => model.id === event.target.value)
                        setSelectedModelId(event.target.value)
                        if (nextModel) {
                          setDetails((current) => ({
                            ...current,
                            focalLength: nextModel.lens_spec.focal_length.min,
                          }))
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="" className="bg-card text-primary">Select a model</option>
                      {filteredModels.map((model) => (
                        <option key={model.id} value={model.id} className="bg-card text-primary">
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {selectedModel && (
                    <div className="rounded-lg border border-surface/30 bg-surface/10 p-3 text-sm text-muted">
                      <p className="font-semibold text-primary">{selectedModel.manufacturer} {selectedModel.model}</p>
                      <p>Focal range: {selectedModel.lens_spec.focal_length.min} - {selectedModel.lens_spec.focal_length.max} mm</p>
                      <p>Rendered FOV: {hFov.toFixed(1)} deg horizontal, {vFov.toFixed(1)} deg vertical</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>

            <div className="flex-1">
              <CollapsibleSection title="Installation details" defaultOpen>
                <div className="flex flex-col gap-4">
                  <NumberInput
                    label="Camera height"
                    unit="m"
                    min={0.5}
                    step={0.1}
                    value={details.height}
                    onChange={(height) => setDetails((current) => ({ ...current, height }))}
                  />
                  <NumberInput
                    label="Focal length"
                    unit="mm"
                    min={focalRange?.min ?? 1}
                    max={focalRange?.max}
                    step={0.1}
                    value={focalLength}
                    onChange={(nextFocalLength) => setDetails((current) => ({
                      ...current,
                      focalLength: focalRange
                        ? clamp(nextFocalLength, focalRange.min, focalRange.max)
                        : nextFocalLength,
                    }))}
                  />
                  <NumberInput
                    label="Target distance"
                    unit="m"
                    min={1}
                    step={0.5}
                    value={details.targetDistance}
                    onChange={(targetDistance) => setDetails((current) => ({ ...current, targetDistance }))}
                  />
                </div>
              </CollapsibleSection>
            </div>
          </aside>

          <section className="min-h-[680px] rounded-xl border border-surface/30 bg-card/80 p-4 shadow-xl">
            <FovScene selectedModel={selectedModel} details={details} hFov={hFov} vFov={vFov} />
          </section>
        </div>
      </main>
    </div>
  )
}
