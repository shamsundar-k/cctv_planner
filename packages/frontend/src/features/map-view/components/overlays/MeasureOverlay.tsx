import { useEffect } from 'react'
import L from 'leaflet'
import { useMapContext } from '@/context/MapContext'
import { useMapActionsStore } from '@/store/mapActionsSlice'
import MapToolBanner from './MapToolBanner'

function getLinePoints(layer: L.Polyline): L.LatLng[] {
    const latLngs = layer.getLatLngs()

    if (latLngs.every((latLng) => latLng instanceof L.LatLng)) {
        return latLngs
    }

    return []
}

function getTotalDistance(map: L.Map, points: L.LatLng[]): number {
    return points.slice(1).reduce(
        (total, point, index) => total + map.distance(points[index], point),
        0,
    )
}

function formatDistance(distanceInMetres: number): string {
    if (distanceInMetres >= 1000) {
        return `${(distanceInMetres / 1000).toFixed(2)} km`
    }

    return `${distanceInMetres < 10 ? distanceInMetres.toFixed(1) : distanceInMetres.toFixed(0)} m`
}

export default function MeasureOverlay() {
    const { mapRef } = useMapContext()
    const setActiveTool = useMapActionsStore((state) => state.setActiveTool)

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const handleCreate: L.PM.CreateEventHandler = (event) => {
            if (event.shape !== 'Line' || !(event.layer instanceof L.Polyline)) return

            const points = getLinePoints(event.layer)
            const totalDistance = getTotalDistance(map, points)

            event.layer.setStyle({
                color: 'var(--color-distance-line)',
                dashArray: '8 6',
                weight: 3,
            })
            event.layer.options.pmIgnore = true
            event.layer.pm.disable()
            event.layer
                .bindTooltip(formatDistance(totalDistance), {
                    className: 'map-measurement-tooltip',
                    direction: 'center',
                    opacity: 1,
                    permanent: true,
                })
                .openTooltip()

            setActiveTool('select')
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveTool('select')
            }
        }

        map.on('pm:create', handleCreate)
        window.addEventListener('keydown', handleKeyDown)
        map.pm.enableDraw('Line', {
            continueDrawing: false,
            finishOnEnter: true,
            pathOptions: {
                color: 'var(--color-distance-line)',
                dashArray: '8 6',
                weight: 3,
            },
            templineStyle: {
                color: 'var(--color-distance-line)',
                weight: 3,
            },
            hintlineStyle: {
                color: 'var(--color-distance-line)',
                dashArray: '6 6',
                weight: 2,
            },
        })

        return () => {
            map.off('pm:create', handleCreate)
            window.removeEventListener('keydown', handleKeyDown)
            map.pm.disableDraw('Line')
        }
    }, [mapRef, setActiveTool])

    return (
        <MapToolBanner
            title="Measure Distance"
            instructions="Click to add points. Double-click or press Enter to finish."
        />
    )
}
