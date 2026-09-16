import { getAllInspections } from '@/features/inspections/services';
import { redirect } from 'next/navigation';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { getUser } from '@/lib/auth/auth';

export default async function ReportsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // отримання даних (тепер через user.id)
  const inspections = await getAllInspections(user.id);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="w-6 h-6" />
        <h1 className="text-xl font-bold">Reports</h1>
      </div>

      <div className="space-y-3">
        {inspections?.length ? (
          inspections.map((inspection: any) => (
            <div
              key={inspection.id}
              className="p-4 border rounded-lg bg-white dark:bg-card"
            >
              <p className="font-semibold">Vehicle: {inspection.vehicle_id}</p>
              <p className="text-sm text-gray-500">
                Status: {inspection.status}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(inspection.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reports found</p>
        )}
      </div>
    </div>
  );
}
