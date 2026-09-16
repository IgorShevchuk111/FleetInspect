'use client';

import React, { useRef, useState } from 'react';
import { useLeafletMap } from './useLeafletMap';
import type { Point } from './routeUtils';

export default function AdminMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<Point | null>(null);
  const [query, setQuery] = useState('');

  const { moveTo } = useLeafletMap(containerRef, setSelected);

  const searchLocation = async () => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query,
      )}&limit=1`,
    );

    const data = await res.json();
    if (!data.length) return;

    const point: Point = {
      lat: +data[0].lat,
      lng: +data[0].lon,
    };

    setSelected(point);
    moveTo(point);
  };

  const googleNavUrl = selected
    ? `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`
    : '';

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* MAP */}
      <div ref={containerRef} style={{ width: '70%', height: 600 }} />

      {/* SIDEBAR */}
      <div style={{ width: '30%' }}>
        <h3>Route Builder</h3>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
        />

        <button onClick={searchLocation}>Search</button>

        {selected && (
          <div style={{ marginTop: 20 }}>
            <p>
              Selected: {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
            </p>

            <button onClick={() => moveTo(selected)}>Center map</button>

            <br />

            <a href={googleNavUrl} target="_blank" rel="noreferrer">
              Open Google Navigation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
