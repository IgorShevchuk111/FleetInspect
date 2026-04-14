'use client';

import Link from 'next/link';
import InspectionOperations from './InspectionOperations';
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface InspectionListProps {
  filter: string;
  sortBy: string;
  inspections: any[];
  searchQuery: string;
  fromPage?: string;
}

// Utility function to format dates consistently
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function InspectionList({
  filter,
  sortBy,
  inspections,
  searchQuery,
  fromPage,
}: InspectionListProps) {
  const [sortedInspections, setSortedInspections] = useState(inspections);

  useEffect(() => {
    let filtered = inspections;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (inspection) =>
          inspection.vehicle.regnumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          inspection.vehicle.type
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          inspection.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          inspection.trip.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(
        (inspection) => inspection.vehicle.type === filter
      );
    }

    // Apply sorting
    const [sortField, sortDirection] = sortBy.split('-');
    filtered.sort((a, b) => {
      let aValue, bValue;

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
          aValue = a.vehicle.type;
          bValue = b.vehicle.type;
          break;
        case 'regnumber':
          aValue = a.vehicle.regnumber;
          bValue = b.vehicle.regnumber;
          break;
        case 'inspector':
          aValue = a.full_name;
          bValue = b.full_name;
          break;
        case 'trip':
          aValue = a.trip;
          bValue = b.trip;
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

    setSortedInspections(filtered);
  }, [inspections, filter, sortBy, searchQuery]);

  if (sortedInspections.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <InspectionOperations searchQuery={searchQuery} />
        <div className="mt-6 text-center py-12">
          <div className="text-muted-foreground dark:text-muted-foreground">
            <p className="text-lg font-medium">No inspections found</p>
            <p className="mt-1 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <InspectionOperations searchQuery={searchQuery} />

      {/* Mobile View (Cards) */}
      <div className="mt-6 grid gap-4 md:hidden">
        {sortedInspections.map((inspection) => {
          const StatusIcon =
            inspection.status === 'passed' ? CheckCircleIcon : XCircleIcon;
          const statusColor =
            inspection.status === 'passed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';

          return (
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
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {inspection.status.charAt(0).toUpperCase() +
                    inspection.status.slice(1)}
                </span>
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
                  href={`/inspection/${inspection.vehicle_id}?trip=${
                    inspection.trip
                  }&inspectionId=${inspection.id}&mode=view&from=${
                    fromPage || 'user-inspections'
                  }`}
                  className="text-sm text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
                >
                  View
                </Link>
                <span className="text-muted-foreground dark:text-muted-foreground">
                  |
                </span>
                <Link
                  href={`/inspection/${inspection.vehicle_id}?trip=${
                    inspection.trip
                  }&inspectionId=${inspection.id}&mode=edit&from=${
                    fromPage || 'user-inspections'
                  }`}
                  className="text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block mt-6 overflow-hidden">
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground dark:text-white sm:pl-6 lg:pl-8"
                    >
                      Vehicle
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white"
                    >
                      Registration
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white"
                    >
                      Inspector
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white"
                    >
                      Trip Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-foreground dark:text-white"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-blue-700">
                  {sortedInspections.map((inspection) => {
                    const StatusIcon =
                      inspection.status === 'passed'
                        ? CheckCircleIcon
                        : XCircleIcon;
                    const statusColor =
                      inspection.status === 'passed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';

                    return (
                      <tr key={inspection.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground dark:text-white sm:pl-6 lg:pl-8">
                          <div>{inspection.vehicle.type}</div>
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
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {inspection.status.charAt(0).toUpperCase() +
                              inspection.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground dark:text-muted-foreground">
                          {formatDate(inspection.created_at)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/inspection/${
                                inspection.vehicle_id
                              }?trip=${inspection.trip}&inspectionId=${
                                inspection.id
                              }&mode=view&from=${
                                fromPage || 'user-inspections'
                              }`}
                              className="text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
                            >
                              View
                            </Link>
                            <span className="text-muted-foreground dark:text-muted-foreground">
                              /
                            </span>
                            <Link
                              href={`/inspection/${
                                inspection.vehicle_id
                              }?trip=${inspection.trip}&inspectionId=${
                                inspection.id
                              }&mode=edit&from=${
                                fromPage || 'user-inspections'
                              }`}
                              className="inline-flex items-center gap-2 text-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionList;
