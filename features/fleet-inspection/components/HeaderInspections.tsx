import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

export default function HeaderInspections() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">
          Vehicle Inspections
        </h1>
        <p className="mt-1 text-muted-foreground hidden md:block">
          Manage and track your vehicle inspection records
        </p>
      </div>

      <Link
        href="/fleet-inspection/inspection"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
      >
        <PlusIcon className="w-5 h-5" />
        New Inspection
      </Link>
    </div>
  );
}
