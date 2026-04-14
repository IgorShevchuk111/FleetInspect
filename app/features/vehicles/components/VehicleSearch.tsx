'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Database } from '@/types/supabase';
import { useDebounce } from '@/app/lib/hooks';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface VehicleSearchProps {
  selectedTrip: string | null;
}

export default function VehicleSearch({ selectedTrip }: VehicleSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Effect to perform search when URL parameters change or debounced search query changes
  useEffect(() => {
    if (!selectedTrip) {
      setVehicles([]);
      setErrorMessage(null);
      return;
    }

    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      setVehicles([]);
      setErrorMessage(null);
    }
  }, [debouncedSearchQuery, selectedTrip]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setErrorMessage(null);
      setVehicles([]);
      return;
    }

    // Don't search for very short terms (less than 2 characters)
    if (query.trim().length < 2) {
      setErrorMessage('Please enter at least 2 characters to search');
      setVehicles([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // First, try exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('regnumber', query.toUpperCase());

      if (exactError) {
        throw exactError;
      }

      if (exactMatch && exactMatch.length > 0) {
        setVehicles(exactMatch);
        return;
      }

      // If no exact match, try case-insensitive partial match
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('regnumber', `%${query}%`);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setErrorMessage(`No vehicles found matching "${query}"`);
        setVehicles([]);
      } else {
        setVehicles(data);
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage('Failed to search vehicles. Please try again.');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) {
      params.set('search', newQuery);
    } else {
      params.delete('search');
    }
    router.push(`/inspection?${params.toString()}`);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    if (!selectedTrip) {
      setErrorMessage('Please select a trip type first');
      return;
    }
    router.push(`/inspection/${vehicleId}?trip=${selectedTrip}`);
  };

  return (
    <div className="w-full space-y-4">
      {!selectedTrip && searchQuery && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            👆 Please select a trip type above to start searching
          </p>
        </div>
      )}

      <div className="relative">
        <label htmlFor="vehicle-search-input" className="sr-only">
          Search vehicles by registration number
        </label>
        <input
          type="text"
          id="vehicle-search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by registration number..."
          className="w-full rounded-lg border bg-white px-6 py-4 pr-16 text-base shadow-sm focus:outline-none focus:ring-2 border-border focus:border-primary focus:ring-ring500 dark:bg-card dark:text-white dark:border-border dark:focus:border-primary dark:focus:ring-ring400"
        />
        <div
          className={`absolute inset-y-0 right-0 flex items-center px-6 ${
            isLoading ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-blue-600" />
          ) : (
            <MagnifyingGlassIcon className="h-6 w-6" />
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {errorMessage}
          </p>
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-primary dark:text-muted-foreground">
            Found {vehicles.length}{' '}
            {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleSelect(vehicle.id)}
                className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 text-left hover:border-primary dark:border-border dark:bg-card dark:hover:border-primary min-h-[60px]"
              >
                <div>
                  <h3 className="font-medium text-foreground dark:text-white text-base">
                    {vehicle.regnumber}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground capitalize">
                    {vehicle.type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
