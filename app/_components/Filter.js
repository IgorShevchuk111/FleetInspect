'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const options = [
  { value: 'all', label: ' All' },
  { value: 'truck', label: 'Trucks' },
  { value: 'trailer', label: 'Trailers' },
];

function Filter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const activeFilter = searchParams.get('filter') ?? 'all';

  function handleFilter(filter) {
    const params = new URLSearchParams(searchParams);
    params.set('filter', filter);
    router.replace(`${pathName}?${params.toString()}`, { scroll: false });
  }
  return (
    <div className=" flex items-center">
      {options?.map((option) => (
        <Button
          key={option.value}
          activeFilter={activeFilter}
          handleFilter={handleFilter}
          filter={option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function Button({ filter, handleFilter, activeFilter, children }) {
  return (
    <button
      onClick={() => handleFilter(filter)}
      className={`
      ${activeFilter === filter ? 'border rounded-md' : ''} 
      px-2 py-1 hover:bg-gray-50 hover:border rounded-md`}
    >
      {children}
    </button>
  );
}

export default Filter;
