import { auth } from '@/app/features/auth/utils/auth';
import { getAllInspections, getUserInspections } from '@/app/lib/data_servis';
import InspectionList from '@/app/features/inspections/components/InspectionList';
import { UsersIcon } from '@heroicons/react/24/outline';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    sortBy?: string;
    search?: string;
  }>;
}

export default async function UserInspectionsPage({ searchParams }: PageProps) {
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

  // Get inspections based on user role
  let inspections;
  const isAdmin = session.user.role === 'admin';

  if (isAdmin) {
    // Admin sees all inspections
    inspections = await getAllInspections();
  } else {
    // Regular users see only their own inspections
    const userId = session.user.userId || session.user.id;
    if (!userId) {
      throw new Error('User ID not found in session');
    }
    inspections = await getUserInspections(userId);
  }

  // Get filter and sort parameters from URL
  const params = await searchParams;
  const filter = params.filter || 'all';
  const sortBy = params.sortBy || 'created_at-desc';
  const searchQuery = params.search || '';

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">
              {isAdmin ? 'All User Inspections' : 'My Inspections'}
            </h1>
            <p className=" hidden md:block mt-1 text-primary dark:text-muted-foreground">
              {isAdmin
                ? 'View and manage all vehicle inspection records across users'
                : 'Manage and track your vehicle inspection records'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
              {isAdmin
                ? `${inspections.length} total inspections`
                : `${inspections.length} inspections`}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm">
          <InspectionList
            filter={filter}
            sortBy={sortBy}
            inspections={inspections}
            searchQuery={searchQuery}
            fromPage="user-inspections"
          />
        </div>
      </div>
    </div>
  );
}
