import { auth } from '@/app/features/auth/utils/auth';
import { getUserInspections } from '@/app/lib/data_servis';
import InspectionList from '@/app/features/inspections/components/InspectionList';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    sortBy?: string;
    search?: string;
  }>;
}

export default async function InspectionsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faff] dark:bg-blue-950">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">
          Please sign in to view inspections
        </h1>
      </div>
    );
  }

  const userId = session.user.userId || session.user.id;
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  const inspections = await getUserInspections(userId);

  // Get filter and sort parameters from URL
  const params = await searchParams;
  const filter = params.filter || 'all';
  const sortBy = params.sortBy || 'created_at-desc';
  const searchQuery = params.search || '';

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">
              Vehicle Inspections
            </h1>
            <p className="mt-1 text-muted-foreground dark:text-muted-foreground hidden md:block">
              Manage and track your vehicle inspection records
            </p>
          </div>
          <Link
            href="/inspection"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            New Inspection
          </Link>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm">
          <InspectionList
            filter={filter}
            sortBy={sortBy}
            inspections={inspections}
            searchQuery={searchQuery}
            fromPage="inspections"
          />
        </div>
      </div>
    </div>
  );
}
