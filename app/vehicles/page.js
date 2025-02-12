import VehiclesList from '../_components/VehiclesList';
import { Suspense } from 'react';
import Spinner from '../_components/Spinner';
import SearchInput from '../_components/SearchInput';
import { searchVehicles } from '../_lib/actions';

export default async function VehiclesPage({ searchParams }) {
  const searchQuery = searchParams?.search || '';
  const vehicles = await searchVehicles(searchQuery);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Vehicles</h1>

      <SearchInput searchQuery={searchQuery} />

      <Suspense fallback={<Spinner />}>
        <VehiclesList vehicles={vehicles} />
      </Suspense>
    </div>
  );
}
