import { TripSelector } from '@/features/inspections/components/TripSelector';
import VehicleSearch from '@/features/vehicles/components/VehicleSearch';

interface PageProps {
  searchParams: Promise<{
    trip?: string;
    search?: string;
  }>;
}

export default async function InspectionPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const selectedTrip = params.trip ?? null;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HERO */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
            New Inspection
          </h1>
          <div className="w-16 h-0.5 bg-blue-600 rounded-full mx-auto" />
        </div>

        {/* TRIP SELECTOR */}
        <TripSelector selectedTrip={selectedTrip} />

        {/* SEARCH */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 p-4 sm:p-6">
            <VehicleSearch selectedTrip={selectedTrip} />
          </div>
        </div>
      </div>
    </div>
  );
}
