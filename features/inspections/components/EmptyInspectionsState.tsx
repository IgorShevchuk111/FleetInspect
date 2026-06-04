// features/inspections/components/EmptyInspectionsState.tsx

import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export function EmptyInspectionsState() {
  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950 flex justify-center mt-11">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-foreground dark:text-white">
          You don&apos;t have inspections yet
        </h2>

        <p className="mt-2 text-muted-foreground">
          Create your first vehicle inspection to get started.
        </p>

        <Link
          href="/inspection"
          className="inline-flex mt-6 items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Inspection
        </Link>
      </div>
    </div>
  );
}
