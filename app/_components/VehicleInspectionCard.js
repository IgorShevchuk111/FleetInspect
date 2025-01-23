import { format } from 'date-fns';
import Link from 'next/link';
import _ from 'lodash';

export default function VehicleInspectionCard({ inspection }) {
  return (
    <Link
      href={`/inspections/edit/${inspection.id}`}
      className="block border rounded-lg p-4 shadow hover:shadow-lg transition hover:bg-gray-50"
    >
      <h2 className="text-xl font-bold mb-1 ">{inspection.regNumber}</h2>
      <p>Vehicle Type: {inspection.vehicleType}</p>
      <p>Date: {format(new Date(inspection.created_at), 'dd.MM.yyyy')}</p>
      <p>
        Trip: <span>{_.startCase(inspection.trip)}</span>
      </p>
      <p
        className={`text-sm font-semibold mt-2 ${
          inspection.status === 'Passed' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        Status: {inspection.status}
      </p>
    </Link>
  );
}
