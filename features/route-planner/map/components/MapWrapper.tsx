'use client';

import dynamic from 'next/dynamic';

// Move the dynamic import here inside the client boundary
const MapElement = dynamic(() => import('@/features/map/components/AdminMap'), {
  ssr: false,
  loading: () => <p className="p-4 text-center">Loading map elements...</p>,
});

export default function MapWrapper() {
  return <MapElement />;
}
