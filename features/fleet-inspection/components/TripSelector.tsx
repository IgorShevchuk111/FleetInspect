'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function TripSelector({
  selectedTrip,
}: {
  selectedTrip: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateTrip = (trip: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('trip', trip);

    router.replace(`?${params.toString()}`);
  };

  const isActive = (trip: string) => selectedTrip === trip;

  return (
    <div className="max-w-3xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={() => updateTrip('pre-trip')}
        className={`px-5 py-2.5 rounded-lg ${
          isActive('pre-trip') ? 'bg-blue-600 text-white' : 'bg-white border'
        }`}
      >
        Pre-Trip
      </button>

      <button
        onClick={() => updateTrip('post-trip')}
        className={`px-5 py-2.5 rounded-lg ${
          isActive('post-trip') ? 'bg-blue-600 text-white' : 'bg-white border'
        }`}
      >
        Post-Trip
      </button>
    </div>
  );
}
