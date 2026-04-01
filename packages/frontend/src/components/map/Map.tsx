// src/components/map/Map.tsx

import { useEffect, useRef, useState, type ReactNode } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContext } from '../../context/MapContext';
import BaseTile from './BaseTile';


interface MapProps {
    center?: L.LatLngExpression;
    zoom?: number;
    children?: ReactNode;
}

export default function Map({
    center = [51.5, -0.09],
    zoom = 13,
    children,
}: MapProps) {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    console.log("Running MAP")

    // Init map once
    useEffect(() => {
        if (mapInstanceRef.current || !mapDivRef.current) return;
        console.log("Creating map instance")

        mapInstanceRef.current = L.map(mapDivRef.current).setView(center, zoom);
        setMapReady(true);

        return () => {
            console.log("Removing map instance")
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []); // intentionally empty — init once only

    return (
        <MapContext.Provider value={mapInstanceRef}>
            <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
            {mapReady && <BaseTile />}

        </MapContext.Provider>
    );
}
