import { useState } from 'react'
import { Layers, Map } from 'lucide-react'
import ToolbarButton from './ToolbarButton'
import BasemapPanel from './BasemapPanel'
import LayersPanel from './LayersPanel'

type PanelKey = 'layers' | 'basemap'

export default function MapLayersControl() {
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)

  const toggle = (key: PanelKey) =>
    setOpenPanel((prev) => (prev === key ? null : key))

  const close = () => setOpenPanel(null)

  const buttons: { key: PanelKey; icon: React.ReactNode; label: string }[] = [
    { key: 'layers', icon: <Layers size={15} />, label: 'Layers' },
    { key: 'basemap', icon: <Map size={15} />, label: 'Base Map' },
  ]

  return (
    <div className="absolute right-3 top-1/2 z-[1000] flex -translate-y-1/2 flex-col gap-1.5 rounded-lg border border-panel-border bg-panel/90 p-1.5 shadow-lg backdrop-blur-md">
      {buttons.map(({ key, icon, label }) => (
        <div key={key} className="relative">
          <ToolbarButton
            icon={icon}
            label={label}
            isActive={openPanel === key}
            onClick={() => toggle(key)}
          />
          {openPanel === key && (
            <div
              className="absolute"
              style={{ right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' }}
            >
              {key === 'basemap' && <BasemapPanel onClose={close} />}
              {key === 'layers' && <LayersPanel onClose={close} />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
