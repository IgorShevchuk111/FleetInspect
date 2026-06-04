'use client';

import Link from 'next/link';
import { TruckIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

import { formatDate } from '@/features/inspections/inspectionStyles';
import InspectionStatusBadge from './InspectionStatusBadge';

export default function InspectionMobileCards({ inspections, fromPage }: any) {
  return (
    <div className="mt-6 grid gap-4 md:hidden">
      {inspections.map((inspection: any) => (
        <div
          key={inspection.id}
          className="bg-white dark:bg-card shadow rounded-lg border border-blue-100 dark:border-blue-800 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground dark:text-white">
                  {inspection.vehicle.regnumber}
                </div>

                <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {inspection.vehicle.type}
                </div>
              </div>
            </div>

            <InspectionStatusBadge status={inspection.status} />
          </div>

          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
            <UserIcon className="h-4 w-4 mr-1.5" />
            {inspection.full_name}
          </div>

          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1.5" />
            {formatDate(inspection.created_at)}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-blue-100 dark:border-blue-800">
            <Link
              href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=view&from=${fromPage || 'user-inspections'}`}
              className="text-sm text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
            >
              View
            </Link>

            <span className="text-muted-foreground dark:text-muted-foreground">
              |
            </span>

            <Link
              href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=edit&from=${fromPage || 'user-inspections'}`}
              className="text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
