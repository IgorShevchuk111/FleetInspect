'use client';

import Link from 'next/link';
import { formatDate } from '@/features/inspections/inspectionStyles';
import InspectionStatusBadge from './InspectionStatusBadge';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function InspectionTable({ inspections, fromPage }: any) {
  return (
    <div className="hidden md:block mt-6 overflow-hidden">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-700">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground dark:text-white sm:pl-6 lg:pl-8">
                    Vehicle
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white">
                    Registration
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white">
                    Inspector
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white">
                    Trip Type
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white">
                    Date
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-100 dark:divide-blue-700">
                {inspections.map((inspection: any) => (
                  <tr key={inspection.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground dark:text-white sm:pl-6 lg:pl-8">
                      {inspection.vehicle.type}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground dark:text-white">
                      {inspection.vehicle.regnumber}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {inspection.full_name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {inspection.trip}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <InspectionStatusBadge status={inspection.status} />
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                      {formatDate(inspection.created_at)}
                    </td>

                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=view&from=${fromPage || 'user-inspections'}`}
                          className="text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
                        >
                          View
                        </Link>

                        <span className="text-muted-foreground dark:text-muted-foreground">
                          /
                        </span>

                        <Link
                          href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=edit&from=${fromPage || 'user-inspections'}`}
                          className="inline-flex items-center gap-2 text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
