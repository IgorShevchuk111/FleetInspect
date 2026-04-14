'use client';

import VehicleSearch from '@/app/features/vehicles/components/VehicleSearch';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(
    searchParams.get('trip')
  );

  const handleTripSelect = (trip: string) => {
    setSelectedTrip(trip);

    // Update URL with trip parameter and preserve search if exists
    const params = new URLSearchParams(searchParams.toString());
    params.set('trip', trip);
    router.push(`/inspection?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
              New Inspection
            </h1>
            <div className="w-16 h-0.5 bg-blue-600 rounded-full mx-auto"></div>
          </div>

          {/* Trip Selection - Moved above search */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={() => handleTripSelect('pre-trip')}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 shadow-sm ${
                  selectedTrip === 'pre-trip'
                    ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700 hover:bg-blue-700'
                    : 'bg-white dark:bg-card text-secondary-foreground dark:text-muted-foreground border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                Pre-Trip
              </button>
              <button
                onClick={() => handleTripSelect('post-trip')}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 shadow-sm ${
                  selectedTrip === 'post-trip'
                    ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700 hover:bg-blue-700'
                    : 'bg-white dark:bg-card text-secondary-foreground dark:text-muted-foreground border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                Post-Trip
              </button>
            </div>
          </div>

          {/* Main Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 p-4 sm:p-6">
              <VehicleSearch selectedTrip={selectedTrip} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
