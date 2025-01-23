import InspectionOperations from '@/app/_components/InspectionOperations';
import InspectionList from '../_components/InspectionList';
import { Suspense } from 'react';
import Spinner from '../_components/Spinner';

export default function Page({ searchParams }) {
  const filter = searchParams?.filter ?? 'all';
  const sortBy = searchParams?.sortBy ?? 'created_at-desc';

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Your Inspections</h1>
      <InspectionOperations />

      <Suspense fallback={<Spinner />} key={filter}>
        <InspectionList filter={filter} sortBy={sortBy} />
      </Suspense>
    </div>
  );
}
