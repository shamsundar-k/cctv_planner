import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { BASE_MAPS, DEFAULT_BASE_MAP } from "@/config/mapConfig";

interface ProjectLocationPickerProps {
  lat: number | null;
  lng: number | null;
  zoom: number | null;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
  height?: number | string;
  onChange: (value: { lat: number; lng: number; zoom: number }) => void;
}

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;
const DEFAULT_ZOOM = 13;

function roundCoordinate(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

function patchLeafletMarkerIcons(L: typeof import("leaflet")) {
  delete (
    L.Icon.Default.prototype as unknown as Record<string, unknown>
  )._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function ProjectLocationPicker({
  lat,
  lng,
  zoom,
  defaultLat = DEFAULT_LAT,
  defaultLng = DEFAULT_LNG,
  defaultZoom = DEFAULT_ZOOM,
  height = 260,
  onChange,
}: ProjectLocationPickerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef({
    lat,
    lng,
    zoom,
    defaultLat,
    defaultLng,
    defaultZoom,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = {
      lat,
      lng,
      zoom,
      defaultLat,
      defaultLng,
      defaultZoom,
    };
  }, [defaultLat, defaultLng, defaultZoom, lat, lng, zoom]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current || mapRef.current) return;

      patchLeafletMarkerIcons(L);

      const initialValue = valueRef.current;
      const hasInitialPosition =
        initialValue.lat != null && initialValue.lng != null;
      const initialLat = hasInitialPosition
        ? initialValue.lat!
        : initialValue.defaultLat;
      const initialLng = hasInitialPosition
        ? initialValue.lng!
        : initialValue.defaultLng;
      const initialZoom = initialValue.zoom ?? initialValue.defaultZoom;

      const map = L.map(containerRef.current).setView(
        [initialLat, initialLng],
        initialZoom,
      );
      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());

      const baseMap = BASE_MAPS[DEFAULT_BASE_MAP];

      L.tileLayer(baseMap.get_url(), {
        attribution: baseMap.attribution,
        maxZoom: 20,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const nextLat = roundCoordinate(pos.lat);
        const nextLng = roundCoordinate(pos.lng);

        onChangeRef.current({
          lat: nextLat,
          lng: nextLng,
          zoom: map.getZoom(),
        });
      });

      map.on("click", (e) => {
        const nextLat = roundCoordinate(e.latlng.lat);
        const nextLng = roundCoordinate(e.latlng.lng);

        marker.setLatLng([nextLat, nextLng]);

        onChangeRef.current({
          lat: nextLat,
          lng: nextLng,
          zoom: map.getZoom(),
        });
      });

      map.on("zoomend", () => {
        const pos = marker.getLatLng();

        onChangeRef.current({
          lat: roundCoordinate(pos.lat),
          lng: roundCoordinate(pos.lng),
          zoom: map.getZoom(),
        });
      });
    });

    return () => {
      disposed = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (lat == null || lng == null) return;

    const currentPosition = markerRef.current.getLatLng();
    const markerMoved =
      roundCoordinate(currentPosition.lat) !== lat ||
      roundCoordinate(currentPosition.lng) !== lng;
    const currentZoom = mapRef.current.getZoom();
    const nextZoom = zoom ?? currentZoom;

    markerRef.current.setLatLng([lat, lng]);

    if (markerMoved) {
      mapRef.current.setView([lat, lng], nextZoom, { animate: false });
      return;
    }

    if (zoom != null && zoom !== currentZoom) {
      mapRef.current.setZoom(zoom, { animate: false });
    }
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border border-panel-border bg-background"
      style={{ height }}
    />
  );
}
