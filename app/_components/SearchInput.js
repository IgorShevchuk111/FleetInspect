'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchInput({ searchQuery }) {
  const [query, setQuery] = useState(searchQuery);
  const router = useRouter();

  useEffect(() => {
    if (query.trim() === '') {
      router.push('/vehicles');
    } else {
      router.push(`/vehicles?search=${query}`);
    }
  }, [query, router]);

  return (
    <div className="mb-4 flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by reg number..."
        className="border p-2 rounded-md w-full"
      />
    </div>
  );
}
