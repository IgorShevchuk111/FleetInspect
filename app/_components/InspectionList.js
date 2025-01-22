import { auth } from '../_lib/auth';
import { getUserInspections } from '../_lib/data_servis';
import VehicleInspectionCard from './VehicleInspectionCard';

async function InspectionList({ filter, sortBy }) {
  const session = await auth();
  const inspections = await getUserInspections(session.user.userId);

  if (inspections.length === 0) return null;

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedInspections.map((inspection) => (
        <VehicleInspectionCard key={inspection.id} inspection={inspection} />
      ))}
    </div>
  );
}

export default InspectionList;
