'use client';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Select from '@/app/_components/Select';

const options = [
  { value: 'created_at-desc', label: 'Newest first' },
  { value: 'created_at-asc', label: 'Oldest first' },
];

export default function SortBy() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const activeSortBy = searchParams.get('sortBy') ?? 'created_at-desc';

  function handleChange(newSortBy) {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    router.replace(`${pathName}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select
      options={options}
      type="white"
      onChange={handleChange}
      value={activeSortBy}
    />
  );
}
