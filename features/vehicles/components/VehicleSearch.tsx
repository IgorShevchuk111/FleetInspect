'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useVehicleSearch } from '@/features/vehicles/hooks/useVehicleSearch';

interface VehicleSearchProps {
  selectedTrip: string | null;
}

export default function VehicleSearch({ selectedTrip }: VehicleSearchProps) {
  const { query, vehicles, error, isPending, setSearch, selectVehicle } =
    useVehicleSearch(selectedTrip);

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicle registration..."
          className="w-full rounded-lg border px-6 py-4 pr-16 bg-white shadow-sm focus:ring-2"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-blue-600" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {!selectedTrip && query && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Select trip type to continue
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{vehicles.length} results</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => selectVehicle(vehicle.id)}
                className="p-4 border rounded-lg text-left hover:border-black transition"
              >
                <div className="font-medium">{vehicle.regnumber}</div>

                <div className="text-sm text-gray-500">{vehicle.type}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
