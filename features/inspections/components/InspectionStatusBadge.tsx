'use client';

import {
  getStatusIcon,
  getStatusColor,
} from '@/features/inspections/inspectionStyles';

export default function InspectionStatusBadge({ status }: { status: string }) {
  const Icon = getStatusIcon(status);
  const color = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      <Icon className="w-4 h-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
