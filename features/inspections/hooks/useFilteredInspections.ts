'use client';

import { useEffect, useState } from 'react';

export function useFilteredInspections({
    inspections,
    filter,
    sortBy,
    searchQuery,
}: any) {
    const [sortedInspections, setSortedInspections] = useState(inspections);

    useEffect(() => {
        let filtered = inspections;

        if (searchQuery) {
            filtered = filtered.filter(
                (inspection: any) =>
                    inspection.vehicle.regnumber
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    inspection.vehicle.type
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    inspection.full_name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    inspection.trip.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        if (filter !== 'all') {
            filtered = filtered.filter(
                (inspection: any) => inspection.vehicle.type === filter,
            );
        }

        const [sortField, sortDirection] = sortBy.split('-');

        filtered.sort((a: any, b: any) => {
            let aValue: any;
            let bValue: any;

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
            }

            return aValue > bValue ? 1 : -1;
        });

        setSortedInspections(filtered);
    }, [inspections, filter, sortBy, searchQuery]);

    return sortedInspections;
}