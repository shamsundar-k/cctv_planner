import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { CameraSpecRecord } from '@/types/camera'
import { cameraSpecImageUrl } from '../api/cameraSpecImages'

interface Props {
  camera: CameraSpecRecord
  className?: string
}

interface ContentProps extends Props {
  source: string
}

function CameraSpecImageContent({ camera, className = '', source }: ContentProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div
      className={`relative overflow-hidden border border-panel-border bg-background ${className}`}
      aria-busy={status === 'loading'}
    >
      {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-divider" />}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
          <ImageOff size={28} aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
      <img
        src={source}
        alt={`${camera.name} camera`}
        className={`h-full w-full object-contain p-3 transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

export default function CameraSpecImage(props: Props) {
  const source = cameraSpecImageUrl(props.camera.id, props.camera.image_version)
  return <CameraSpecImageContent key={source} {...props} source={source} />
}
