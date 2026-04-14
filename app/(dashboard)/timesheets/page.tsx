import { auth } from '@/app/features/auth/utils/auth';
import TimesheetForm from '@/app/features/timesheets/components/TimesheetForm';
import { ClockIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Timesheets',
  description:
    'View and manage employee timesheets with ease using FleetInspect.',
};

export default async function TimesheetsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faff] dark:bg-blue-950 px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-4 text-center">
          Please sign in to view timesheets
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
              Timesheets
            </h1>
            <p className=" hidden md:block mt-1 text-sm sm:text-base text-primary dark:text-muted-foreground">
              Track and manage your weekly work hours and activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">
              Weekly tracking
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6">
            <TimesheetForm />
          </div>
        </div>
      </div>
    </div>
  );
}
