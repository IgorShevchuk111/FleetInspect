import { getUserInspections } from '@/features/inspections/services';
import InspectionListContent from '@/features/inspections/components/InspectionListContent';
import { getUser } from '@/lib/auth/auth';
import { EmptyInspectionsState } from '@/features/inspections/components/EmptyInspectionsState';
import { InspectionCardLayout } from '@/features/inspections/components/InspectionCardLayout';
import HeaderInspections from '@/features/inspections/components/HeaderInspections';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    sortBy?: string;
    search?: string;
  }>;
}

export default async function InspectionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getUser();

  if (!user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faff] dark:bg-blue-950">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">
          Please sign in to view inspections
        </h1>
      </div>
    );
  }

  const inspections = await getUserInspections(user.id);
  const filter = params.filter ?? 'all';
  const sortBy = params.sortBy ?? 'created_at-desc';
  const searchQuery = params.search ?? '';

  if (!inspections.length) {
    return <EmptyInspectionsState />;
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeaderInspections />
        <InspectionCardLayout>
          <InspectionListContent
            filter={filter}
            sortBy={sortBy}
            inspections={inspections}
            searchQuery={searchQuery}
            fromPage="inspections"
          />
        </InspectionCardLayout>
      </div>
    </div>
  );
}
