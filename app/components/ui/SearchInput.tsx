'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchInput({ searchQuery }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div>
      <label htmlFor="mobile-search-field" className="sr-only">
        Search inspections
      </label>
      <input
        type="text"
        name="search"
        id="mobile-search-field"
        aria-label="Search inspections"
        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-foreground dark:text-white ring-1 ring-inset ring-blue-200 dark:ring-blue-700 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-card sm:text-sm sm:leading-6"
        placeholder="Search inspections..."
        defaultValue={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
