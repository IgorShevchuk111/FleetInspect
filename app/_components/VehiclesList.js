import Link from 'next/link';

function VehiclesList({ vehicles }) {
  return (
    <ul className="space-y-2">
      {vehicles.map((vehicle) => (
        <li
          key={vehicle.id}
          className="border p-4 rounded-lg shadow hover:bg-gray-100 flex justify-center"
        >
          <Link href={`/vehicles/${vehicle.id}`} className="block">
            <span className="font-semibold text-3xl">{vehicle.regNumber}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default VehiclesList;
