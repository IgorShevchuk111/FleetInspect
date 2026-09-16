'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Point } from './routeUtils';

// ✅ FIX LEAFLET MARKER ICONS (Next.js issue)
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: icon2x.src ?? icon2x,
    iconUrl: icon.src ?? icon,
    shadowUrl: shadow.src ?? shadow,
});

export function useLeafletMap(
    containerRef: React.RefObject<HTMLDivElement | null>,
    onSelect?: (point: Point) => void,
) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current).setView([53.8, -1.54], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        map.on('click', (e) => {
            const point = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            };

            setMarker(map, point);
            onSelect?.(point);
        });

        mapRef.current = map;

        setTimeout(() => map.invalidateSize(), 0);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [containerRef, onSelect]);

    const setMarker = (map: L.Map, point: Point) => {
        if (markerRef.current) {
            markerRef.current.setLatLng([point.lat, point.lng]);
            return;
        }

        markerRef.current = L.marker([point.lat, point.lng]).addTo(map);
    };

    const moveTo = (point: Point) => {
        const map = mapRef.current;
        if (!map) return;

        map.setView([point.lat, point.lng], 15);
        setMarker(map, point);
    };

    return { moveTo };
}