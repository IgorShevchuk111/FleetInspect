import InspectionList from '../_components/InspectionList';
import { Suspense } from 'react';
import Spinner from '../_components/Spinner';

export default function Page({ searchParams }) {
  const filter = searchParams?.filter ?? 'all';
  const sortBy = searchParams?.sortBy ?? 'created_at-desc';

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<Spinner />} key={filter}>
        <InspectionList filter={filter} sortBy={sortBy} />
      </Suspense>
    </div>
  );
}
