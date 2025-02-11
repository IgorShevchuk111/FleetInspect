import { format } from 'date-fns';
import Link from 'next/link';
import _ from 'lodash';

export default function VehicleInspectionCard({ inspection }) {
  const {
    id,
    regNumber,
    trip,
    status,
    created_at,
    vehicle: { type },
  } = inspection;
  return (
    <Link
      href={`/inspections/edit/${id}`}
      className="block border rounded-lg p-4 shadow hover:shadow-lg transition hover:bg-gray-50"
    >
      <h2 className="text-xl font-bold mb-1 ">{regNumber}</h2>
      <p>Vehicle Type: {type}</p>
      <p>Date: {format(new Date(created_at), 'dd.MM.yyyy')}</p>
      <p>
        Trip: <span>{_.startCase(trip)}</span>
      </p>
      <p
        className={`font-semibold mt-2 ${
          status === 'Passed' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        Status: {status}
      </p>
    </Link>
  );
}
