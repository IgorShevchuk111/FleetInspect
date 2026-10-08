import Link from 'next/link';

import { ArrowRight, ClipboardCheck, Map, Truck } from 'lucide-react';

import { getUser } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const apps = [
  {
    name: 'Fleet Inspection',
    entitlement: 'fleet_inspection',
    description: 'Vehicle inspections, defects, photos and reports.',
    href: '/fleet-inspection/inspection',
    icon: Truck,
  },
  {
    name: 'Driver Journal',
    description:
      'Record shifts, driving time, breaks, rest periods and working time.',
    href: '/driver-journal',
    icon: ClipboardCheck,
  },
  {
    name: 'Route Planner',
    entitlement: 'route_planner',
    description: 'Plan and manage your driving routes efficiently.',
    href: '/route-planner/map',
    icon: Map,
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

  let accessibleApps = apps.filter((app) => !app.entitlement);

  if (user) {
    const supabase = await createClient();

    const { data } = await supabase
      .from('user_entitlements')
      .select('app')
      .eq('user_id', user.id);

    const entitlements = new Set(data?.map((item) => item.app) ?? []);

    accessibleApps = apps.filter(
      (app) => !app.entitlement || entitlements.has(app.entitlement),
    );
  }

  const singleApp = accessibleApps.length === 1;

  return (
    <main className="min-h-full">
      <div
        className={
          singleApp
            ? 'mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-start justify-center px-5 pt-20 sm:px-8 sm:pt-28'
            : 'mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-start px-5 pt-16 sm:px-8 sm:pt-24'
        }
      >
        <div className="w-full">
          {accessDenied && (
            <Alert
              variant="destructive"
              className="mx-auto mb-10 max-w-2xl border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
            >
              <AlertTitle>Access restricted</AlertTitle>
              <AlertDescription>
                You don&apos;t currently have access to {appName}. Please
                contact your administrator if you think you should have access.
              </AlertDescription>
            </Alert>
          )}

          {singleApp ? (
            <div className="mx-auto w-full max-w-sm text-center">
              {accessibleApps.map((app) => {
                const Icon = app.icon;

                return (
                  <Link
                    key={app.name}
                    href={user ? app.href : '/login'}
                    className="group block"
                  >
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-20">
                      <Icon className="size-8 sm:size-9" strokeWidth={1.7} />
                    </div>

                    <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {app.name}
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                      {app.description}
                    </p>

                    <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      <span>Open application</span>

                      <ArrowRight
                        className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                        strokeWidth={2}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-medium text-primary">Applications</p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Your applications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Choose an application to get started.
                </p>
              </div>

              <div className="divide-y divide-border/70 border-y border-border/70">
                {accessibleApps.map((app) => {
                  const Icon = app.icon;

                  return (
                    <Link
                      key={app.name}
                      href={user ? app.href : '/login'}
                      className="group flex items-center gap-4 py-5 transition-colors hover:bg-muted/40 sm:gap-6 sm:py-6"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-12">
                        <Icon className="size-5 sm:size-6" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                          {app.name}
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {app.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        <span className="hidden sm:inline">Open</span>

                        <ArrowRight
                          className="size-5 transition-transform duration-200 group-hover:translate-x-1"
                          strokeWidth={1.8}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
