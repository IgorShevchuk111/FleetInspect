'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const filters = [
  { name: 'All', value: 'all' },
  { name: 'Trucks', value: 'truck' },
  { name: 'Trailers', value: 'trailer' },
];

export default function Filter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentFilter = searchParams.get('filter') || 'all';

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', value);
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full items-center gap-x-1.5 rounded-md bg-white dark:bg-card px-3 py-2 text-sm font-semibold text-foreground dark:text-white shadow-sm ring-1 ring-inset ring-blue-200 dark:ring-blue-700 hover:bg-blue-50 dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <FunnelIcon
            className="-ml-0.5 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          {filters.find((f) => f.value === currentFilter)?.name || 'All'}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 sm:w-40 origin-top-right rounded-md bg-white dark:bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {filters.map((filter) => (
              <Menu.Item key={filter.value}>
                {({ active }) => (
                  <button
                    onClick={() => handleFilter(filter.value)}
                    className={`
                      ${
                        active
                          ? 'bg-blue-50 dark:bg-muted text-foreground dark:text-white'
                          : 'text-secondary-foreground dark:text-muted-foreground'
                      }
                      ${
                        currentFilter === filter.value
                          ? 'bg-blue-50 dark:bg-muted'
                          : ''
                      }
                      group flex w-full items-center px-4 py-3 sm:py-2 text-sm font-medium
                    `}
                  >
                    {filter.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
