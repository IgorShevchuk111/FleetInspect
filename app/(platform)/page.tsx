import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Dumbbell, Map, Truck } from 'lucide-react';

import { getUser } from '@/lib/auth/auth';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const apps = [
  {
    name: 'Fleet Inspection',
    description: 'Vehicle inspections, defects, photos and reports.',
    href: '/fleet-inspection/inspection',
    icon: Truck,
  },
  {
    name: 'Driver Journal',
    description:
      'Record shifts, driving time, breaks, rest periods and working time in one place.',
    href: '/driver-journal',
    icon: ClipboardCheck,
  },
  {
    name: 'Route Planner',
    description: 'Plan and manage your driving routes efficiently.',
    href: '/routes',
    icon: Map,
  },
  {
    name: 'Fitness',
    description: 'Track workouts, nutrition and your progress.',
    href: '/fitness',
    icon: Dumbbell,
  },
];

const appNames: Record<string, string> = {
  fleet_inspection: 'Fleet Inspection',
  driver_journal: 'Driver Journal',
  route_planner: 'Route Planner',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    app?: string;
  }>;
}) {
  const user = await getUser();
  const params = await searchParams;

  const accessDenied = params.error === 'access_denied' && params.app;

  const appName = params.app
    ? (appNames[params.app] ?? 'this application')
    : 'this application';

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      {accessDenied && (
        <Alert
          variant="destructive"
          className="mb-8 border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <AlertTitle>Access restricted</AlertTitle>
          <AlertDescription>
            You don&apos;t currently have access to {appName}. Please contact
            your administrator if you think you should have access.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your tools. One workspace.
        </h1>

        <p className="mt-3 text-muted-foreground">
          Everything you need, organised in one place.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => {
          const Icon = app.icon;

          return (
            <Link
              key={app.name}
              href={user ? app.href : '/login'}
              className="group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <CardTitle>{app.name}</CardTitle>

                  <CardDescription className="leading-6">
                    {app.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-medium">Open application</span>

                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
