'use client';

import InspectionOperations from './InspectionOperations';
import InspectionMobileCards from './InspectionMobileCards';
import InspectionTable from './InspectionTable';
import { useFilteredInspections } from '@/features/inspections/hooks/useFilteredInspections';

export default function InspectionListContent(props: any) {
  const data = useFilteredInspections(props);

  if (!data.length) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 ">
        <InspectionOperations searchQuery={props.searchQuery} />
        <div className="mt-6 text-center py-12">
          <div className="text-muted-foreground dark:text-muted-foreground">
            <p className="text-lg font-medium">No inspections found</p>
            <p className="mt-1 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <InspectionOperations searchQuery={props.searchQuery} />

      <InspectionMobileCards inspections={data} fromPage={props.fromPage} />

      <InspectionTable inspections={data} fromPage={props.fromPage} />
    </div>
  );
}
