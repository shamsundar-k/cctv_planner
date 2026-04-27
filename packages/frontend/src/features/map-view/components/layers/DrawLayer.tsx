import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'


export default function DrawLayer() {
    const { mapRef } = useMapContext()
    const activeTool = useMapActionsStore((s) => s.activeTool)
    const groupRef = useRef<L.LayerGroup | null>(null)

    // Ref so the click handler always reads current activeTool without re-registering
    const activeToolRef = useRef(activeTool)
    useEffect(() => { activeToolRef.current = activeTool }, [activeTool])

    useEffect(() => {
        const map = mapRef.current
        if (!map) return
        const group = L.layerGroup().addTo(map)
        groupRef.current = group
        console.log('DrawLayer initialized')
        return () => {
            group.remove()
            groupRef.current = null
        }
    }, [mapRef]) // eslint-disable-line react-hooks/exhaustive-deps

    // Registered once — reads activeTool via ref at click time
    useEffect(() => {
        const map = mapRef.current
        if (!map) return
        const handler = (e: L.LeafletMouseEvent) => {
            if (activeToolRef.current === 'draw-polygon' || activeToolRef.current === 'draw-line') {
                console.log('DrawLayer clicked', e.latlng)
            }
        }
        map.on('click', handler)
        return () => { map.off('click', handler) }
    }, []) // mapRef is stable; activeTool read via ref

    return null
}
