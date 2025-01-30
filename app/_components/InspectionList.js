import Link from 'next/link';
import { auth } from '../_lib/auth';
import { getUserInspections } from '../_lib/data_servis';
import InspectionOperations from './InspectionOperations';
import VehicleInspectionCard from './VehicleInspectionCard';

async function InspectionList({ filter, sortBy }) {
  const session = await auth();
  const inspections = await getUserInspections(session.user.userId);

  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center mt-8">
        <h1 className="text-gray-500 text-3xl mb-4">
          You don’t have any inspections yet.
        </h1>
        <Link
          href="/inspection"
          className="bg-blue-500 text-gray-50 px-4 py-2 rounded hover:bg-blue-500"
        >
          Add Inspection
        </Link>
      </div>
    );
  }

  let filteredInspections;
  if (filter === 'all') filteredInspections = inspections;
  if (filter === 'truck')
    filteredInspections = inspections.filter(
      (inspection) => inspection.vehicleType === 'truck'
    );
  if (filter === 'trailer')
    filteredInspections = inspections.filter(
      (inspection) => inspection.vehicleType === 'trailer'
    );

  const [field, direction] = sortBy.split('-');

  const modifier = direction === 'asc' ? 1 : -1;

  const sortedInspections = filteredInspections.sort((a, b) => {
    if (typeof a[field] === 'string' && typeof b[field] === 'string') {
      return a[field].localeCompare(b[field]) * modifier;
    } else {
      return (a[field] - b[field]) * modifier;
    }
  });

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Your Inspections</h1>
      <InspectionOperations />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedInspections.map((inspection) => (
          <VehicleInspectionCard key={inspection.id} inspection={inspection} />
        ))}
      </div>
    </>
  );
}

export default InspectionList;
