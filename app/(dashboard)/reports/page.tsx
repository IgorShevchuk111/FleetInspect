import { auth } from '@/app/features/auth/utils/auth';
import { getAllInspections } from '@/app/lib/data_servis';
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import ReportFilters from '@/app/components/ui/ReportFilters';

interface PageProps {
  searchParams: Promise<{
    period?: string;
    vehicleType?: string;
    status?: string;
    inspector?: string;
    sortBy?: string;
    search?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faff] dark:bg-blue-950">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Please sign in to view reports
        </h1>
      </div>
    );
  }

  const inspections = await getAllInspections();
  const params = await searchParams;

  // Get filter parameters
  const period = params.period || '30';
  const vehicleType = params.vehicleType || 'all';
  const status = params.status || 'all';
  const inspector = params.inspector || 'all';
  const sortBy = params.sortBy || 'created_at-desc';
  const search = params.search || '';

  // Calculate date range based on period
  const now = new Date();
  const daysAgo = parseInt(period);
  const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  // Apply all filters
  let filteredInspections = inspections.filter((inspection) => {
    // Date filter
    const inspectionDate = new Date(inspection.created_at);
    if (inspectionDate < startDate) return false;

    // Vehicle type filter
    if (vehicleType !== 'all' && inspection.vehicle?.type !== vehicleType)
      return false;

    // Status filter
    if (status !== 'all' && inspection.status !== status) return false;

    // Inspector filter
    if (inspector !== 'all' && inspection.full_name !== inspector) return false;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        inspection.vehicle?.regnumber?.toLowerCase().includes(searchLower) ||
        inspection.vehicle?.type?.toLowerCase().includes(searchLower) ||
        inspection.full_name?.toLowerCase().includes(searchLower) ||
        inspection.trip?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Apply sorting
  const [sortField, sortDirection] = sortBy.split('-');
  filteredInspections.sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortField) {
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'vehicle_type':
        aValue = a.vehicle?.type || '';
        bValue = b.vehicle?.type || '';
        break;
      case 'inspector':
        aValue = a.full_name || '';
        bValue = b.full_name || '';
        break;
      case 'trip':
        aValue = a.trip || '';
        bValue = b.trip || '';
        break;
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }

    if (sortDirection === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

  // Calculate statistics
  const totalInspections = filteredInspections.length;
  const passedInspections = filteredInspections.filter(
    (i) => i.status === 'passed'
  ).length;
  const failedInspections = filteredInspections.filter(
    (i) => i.status === 'failed'
  ).length;
  const passRate =
    totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0;

  // Filter out failed inspections that have newer passed inspections for the same vehicle
  const unresolvedFailedInspections = filteredInspections
    .filter((inspection) => inspection.status === 'failed')
    .reduce((acc, inspection) => {
      const vehicleId = inspection.vehicle_id;
      const existingInspection = acc.find((i) => i.vehicle_id === vehicleId);

      if (
        !existingInspection ||
        new Date(inspection.created_at) >
          new Date(existingInspection.created_at)
      ) {
        // Remove existing inspection for this vehicle if it exists
        const filtered = acc.filter((i) => i.vehicle_id !== vehicleId);
        // Add the newer inspection
        return [...filtered, inspection];
      }

      return acc;
    }, [] as typeof filteredInspections);

  // Get unique values for filters
  const allVehicleTypes = [
    ...new Set(inspections.map((i) => i.vehicle?.type).filter(Boolean)),
  ];
  const allInspectors = [
    ...new Set(inspections.map((i) => i.full_name).filter(Boolean)),
  ];
  const allStatuses = [
    ...new Set(inspections.map((i) => i.status).filter(Boolean)),
  ];

  // Vehicle type breakdown
  const vehicleTypes = filteredInspections.reduce((acc, inspection) => {
    const type = inspection.vehicle?.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Trip type breakdown
  const tripTypes = filteredInspections.reduce((acc, inspection) => {
    const trip = inspection.trip || 'unknown';
    acc[trip] = (acc[trip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Inspector performance
  const inspectorStats = filteredInspections.reduce((acc, inspection) => {
    const inspector = inspection.full_name || 'Unknown';
    if (!acc[inspector]) {
      acc[inspector] = { total: 0, passed: 0, failed: 0 };
    }
    acc[inspector].total += 1;
    if (inspection.status === 'passed') {
      acc[inspector].passed += 1;
    } else {
      acc[inspector].failed += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; passed: number; failed: number }>);

  // Recent activity (most recent inspection per vehicle, up to 10)
  const recentInspections = filteredInspections
    .reduce((acc, inspection) => {
      const vehicleId = inspection.vehicle_id;
      const existingInspection = acc.find((i) => i.vehicle_id === vehicleId);

      if (
        !existingInspection ||
        new Date(inspection.created_at) >
          new Date(existingInspection.created_at)
      ) {
        // Remove existing inspection for this vehicle if it exists
        const filtered = acc.filter((i) => i.vehicle_id !== vehicleId);
        // Add the newer inspection
        return [...filtered, inspection];
      }

      return acc;
    }, [] as typeof filteredInspections)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inspection Reports
              </h1>
              <p className="hidden md:block mt-1 text-gray-600 dark:text-gray-400">
                Analytics and insights from your fleet inspections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last {period} days • {totalInspections} inspections
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ReportFilters
          period={period}
          vehicleType={vehicleType}
          status={status}
          inspector={inspector}
          allVehicleTypes={allVehicleTypes}
          allStatuses={allStatuses}
          allInspectors={allInspectors}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Inspections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalInspections}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {passRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Failed Inspections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {unresolvedFailedInspections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="w-8 h-8 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Daily
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {daysAgo > 0 ? (totalInspections / daysAgo).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Inspections Detail */}
        {unresolvedFailedInspections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              Failed Inspections Details
            </h3>
            <div className="space-y-4">
              {unresolvedFailedInspections.map((inspection) => {
                // Get failed inspection items
                const failedItems = [];
                if (inspection.headlights === 'failed')
                  failedItems.push('Headlights');
                if (inspection.turn_signals === 'failed')
                  failedItems.push('Turn Signals');
                if (inspection.mirrors === 'failed')
                  failedItems.push('Mirrors');
                if (inspection.brakes === 'failed') failedItems.push('Brakes');

                return (
                  <div
                    key={inspection.id}
                    className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {inspection.vehicle?.regnumber} •{' '}
                          {inspection.vehicle?.type}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inspector: {inspection.full_name} • {inspection.trip}{' '}
                          •{' '}
                          {formatDistanceToNow(
                            new Date(inspection.created_at),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Failed
                      </span>
                    </div>

                    {/* Failed Items */}
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Failed Items:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {failedItems.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes for failed items */}
                    <div className="space-y-2">
                      {inspection.headlights === 'failed' &&
                        inspection.headlights_notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Headlights:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {inspection.headlights_notes}
                            </span>
                          </div>
                        )}
                      {inspection.turn_signals === 'failed' &&
                        inspection.turn_signals_notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Turn Signals:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {inspection.turn_signals_notes}
                            </span>
                          </div>
                        )}
                      {inspection.mirrors === 'failed' &&
                        inspection.mirrors_notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Mirrors:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {inspection.mirrors_notes}
                            </span>
                          </div>
                        )}
                      {inspection.brakes === 'failed' &&
                        inspection.brakes_notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Brakes:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {inspection.brakes_notes}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex items-center gap-3">
                      <a
                        href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=view&from=reports`}
                        className="text-sm text-primary hover:text-secondary-foreground dark:text-muted-foreground dark:hover:text-muted-foreground font-medium"
                      >
                        View Details →
                      </a>
                      <a
                        href={`/inspection/${inspection.vehicle_id}?trip=${inspection.trip}`}
                        className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                      >
                        New Inspection →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts and Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Type Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-muted-foreground" />
              Vehicle Type Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(vehicleTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#e6f0ff] dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            ((count as number) / totalInspections) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Type Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-500" />
              Trip Type Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(tripTypes).map(([trip, count]) => (
                <div key={trip} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {trip.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#e6f0ff] dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((count as number) / totalInspections) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspector Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-500" />
            Inspector Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Passed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 dark:divide-gray-700">
                {Object.entries(inspectorStats)
                  .sort(([, a], [, b]) => (b as any).total - (a as any).total)
                  .map(([inspector, stats]) => {
                    const statsTyped = stats as {
                      total: number;
                      passed: number;
                      failed: number;
                    };
                    return (
                      <tr key={inspector}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {inspector}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {statsTyped.total}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                          {statsTyped.passed}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                          {statsTyped.failed}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {statsTyped.total > 0
                            ? (
                                (statsTyped.passed / statsTyped.total) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center justify-between p-4 bg-[#f8faff] dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      inspection.status === 'passed'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {inspection.vehicle?.regnumber} •{' '}
                      {inspection.vehicle?.type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {inspection.full_name} • {inspection.trip}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inspection.status === 'passed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {inspection.status === 'passed' ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4" />
                    )}
                    {inspection.status.charAt(0).toUpperCase() +
                      inspection.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(inspection.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
            {recentInspections.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No inspections found with the current filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
