'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { searchVehicles } from '@/features/vehicles/actions/searchVehicles';
import { Database } from '@/types/supabase/database';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

export function useVehicleSearch(
    selectedTrip: string | null,
) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get('search') ?? '';
    const debouncedQuery = useDebounce(query, 500);

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!selectedTrip) {
            setVehicles([]);
            setError(null);
            return;
        }

        const q = debouncedQuery.trim();

        if (q.length < 3) {
            setVehicles([]);
            setError(null);
            return;
        }

        const requestId = ++requestIdRef.current;

        startTransition(async () => {
            try {
                const data = await searchVehicles(q);

                if (requestId !== requestIdRef.current) return;

                if (!data?.length) {
                    setVehicles([]);
                    setError(`No vehicles found matching "${q}"`);
                    return;
                }

                setVehicles(data);
                setError(null);
            } catch {
                if (requestId !== requestIdRef.current) return;

                setVehicles([]);
                setError('Search failed. Please try again.');
            }
        });
    }, [debouncedQuery, selectedTrip]);

    const setSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value.trim()) {
            params.set('search', value);
        } else {
            params.delete('search');
        }

        router.replace(`?${params.toString()}`);
    };

    const selectVehicle = (vehicleId: string) => {
        if (!selectedTrip) return;

        router.push(
            `/inspection/${vehicleId}?trip=${selectedTrip}`,
        );
    };

    return {
        query,
        vehicles,
        error,
        isPending,
        setSearch,
        selectVehicle,
    };
}