import Filter from '@/app/components/ui/Filter';
import SearchInput from '@/app/components/ui/SearchInput';
import SortBy from '@/app/components/ui/SortBy';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function InspectionOperations({ searchQuery }) {
  return (
    <div className="border-b border-border dark:border-border pb-5 sm:flex sm:items-center sm:justify-between">
      <div className="mt-3 sm:mt-0 sm:ml-4">
        <label htmlFor="mobile-search-field" className="sr-only">
          Search inspections
        </label>
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <SearchInput searchQuery={searchQuery} />
          </div>
        </div>
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2">
        <Filter />
        <SortBy />
      </div>
    </div>
  );
}

export default InspectionOperations;
