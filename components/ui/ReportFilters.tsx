'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface ReportFiltersProps {
  period: string;
  vehicleType: string;
  status: string;
  inspector: string;
  allVehicleTypes: string[];
  allStatuses: string[];
  allInspectors: string[];
}

export default function ReportFilters({
  period,
  vehicleType,
  status,
  inspector,
  allVehicleTypes,
  allStatuses,
  allInspectors,
}: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border border-border dark:border-border mb-8">
      <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
        <FunnelIcon className="w-5 h-5 text-muted-foreground" />
        Filters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label
            htmlFor="period-filter"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-2"
          >
            Time Period
          </label>
          <select
            id="period-filter"
            name="period"
            className="w-full rounded-lg border border-border dark:border-border bg-white dark:bg-muted px-3 py-2 text-sm"
            value={period}
            onChange={(e) => updateFilter('period', e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label
            htmlFor="vehicle-type-filter"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-2"
          >
            Vehicle Type
          </label>
          <select
            id="vehicle-type-filter"
            name="vehicleType"
            className="w-full rounded-lg border border-border dark:border-border bg-white dark:bg-muted px-3 py-2 text-sm"
            value={vehicleType}
            onChange={(e) => updateFilter('vehicleType', e.target.value)}
          >
            <option value="all">All Types</option>
            {allVehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-2"
          >
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            className="w-full rounded-lg border border-border dark:border-border bg-white dark:bg-muted px-3 py-2 text-sm"
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Inspector */}
        <div>
          <label
            htmlFor="inspector-filter"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-2"
          >
            Inspector
          </label>
          <select
            id="inspector-filter"
            name="inspector"
            className="w-full rounded-lg border border-border dark:border-border bg-white dark:bg-muted px-3 py-2 text-sm"
            value={inspector}
            onChange={(e) => updateFilter('inspector', e.target.value)}
          >
            <option value="all">All Inspectors</option>
            {allInspectors.map((inspector) => (
              <option key={inspector} value={inspector}>
                {inspector}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
