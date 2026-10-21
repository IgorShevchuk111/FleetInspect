'use client';

import Link from 'next/link';

import { ArrowRight, ClipboardCheck, Map, Truck } from 'lucide-react';

import { InstallAppActions } from '@/components/shared/install-app-actions';
import { PwaLoginRedirect } from '@/components/shared/pwa-login-redirect';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

type HomeContentProps = {
  isAuthenticated: boolean;
  accessibleAppIds: string[];
  accessDenied: boolean;
  deniedAppId: string;
};

const apps = [
  {
    id: 'fleetInspection',
    entitlement: 'fleet_inspection',
    href: '/fleet-inspection/inspection',
    icon: Truck,
    nameKey: 'profileFleetInspection',
    descriptionKey: 'profileFleetInspectionDescription',
  },
  {
    id: 'driverJournal',
    href: '/driver-journal',
    icon: ClipboardCheck,
    nameKey: 'profileDriverJournal',
    descriptionKey: 'profileDriverJournalDescription',
  },
  {
    id: 'routePlanner',
    entitlement: 'route_planner',
    href: '/route-planner/map',
    icon: Map,
    nameKey: 'profileRoutePlanner',
    descriptionKey: 'profileRoutePlannerDescription',
  },
] as const;

const deniedAppKeys = {
  fleet_inspection: 'profileFleetInspection',
  driver_journal: 'profileDriverJournal',
  route_planner: 'profileRoutePlanner',
} as const;

export default function HomeContent({
  isAuthenticated,
  accessibleAppIds,
  accessDenied,
  deniedAppId,
}: HomeContentProps) {
  const { t } = useTranslations();

  const accessibleApps = apps.filter((app) =>
    accessibleAppIds.includes(app.id),
  );

  const singleApp = accessibleApps.length === 1;
  const deniedAppNameKey = deniedAppKeys[deniedAppId];
  const deniedAppName = deniedAppNameKey
    ? t(deniedAppNameKey)
    : t('homeThisApplication');

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
              <AlertTitle>{t('homeAccessRestricted')}</AlertTitle>
              <AlertDescription>
                {t('homeAccessDeniedPrefix')} {deniedAppName}.{' '}
                {t('homeAccessDeniedSuffix')}
              </AlertDescription>
            </Alert>
          )}

          {singleApp ? (
            <div className="mx-auto w-full max-w-sm text-center">
              {accessibleApps.map((app) => {
                const Icon = app.icon;
                const shouldShowInstallOptions =
                  !isAuthenticated && app.id === 'driverJournal';

                return (
                  <div key={app.id}>
                    <Link
                      href={isAuthenticated ? app.href : '/login'}
                      className="group block"
                    >
                      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-20">
                        <Icon className="size-8 sm:size-9" strokeWidth={1.7} />
                      </div>

                      <h1>{t(app.nameKey)}</h1>

                      <p className="mx-auto mt-3 max-w-sm leading-6 text-muted-foreground">
                        {t(app.descriptionKey)}
                      </p>
                    </Link>

                    {shouldShowInstallOptions ? (
                      <>
                        <PwaLoginRedirect />
                        <InstallAppActions loginHref="/login" />
                      </>
                    ) : (
                      <Link
                        href={isAuthenticated ? app.href : '/login'}
                        className="group mt-7 inline-flex items-center gap-2 font-semibold transition-colors hover:text-primary text-small"
                      >
                        <span>{t('homeOpenApplication')}</span>
                        <ArrowRight
                          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                          strokeWidth={2}
                        />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-medium text-primary">
                  {t('homeApplications')}
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t('homeYourApplications')}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {t('homeChooseApplication')}
                </p>
              </div>

              <div className="divide-y divide-border/70 border-y border-border/70">
                {accessibleApps.map((app) => {
                  const Icon = app.icon;

                  return (
                    <Link
                      key={app.id}
                      href={isAuthenticated ? app.href : '/login'}
                      className="group flex items-center gap-4 py-5 transition-colors hover:bg-muted/40 sm:gap-6 sm:py-6"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-12">
                        <Icon className="size-5 sm:size-6" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                          {t(app.nameKey)}
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {t(app.descriptionKey)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        <span className="hidden sm:inline">
                          {t('homeOpen')}
                        </span>
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
