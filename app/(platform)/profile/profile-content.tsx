'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Map,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SignOutButton from '@/components/ui/SignOutButton';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

type ProfileContentProps = {
  fullName: string;
  email: string;
  accessibleAppIds: string[];
};

const apps = [
  {
    id: 'fleetInspection',
    nameKey: 'profileFleetInspection',
    descriptionKey: 'profileFleetInspectionDescription',
    href: '/fleet-inspection/inspection',
    icon: Truck,
  },
  {
    id: 'driverJournal',
    nameKey: 'profileDriverJournal',
    descriptionKey: 'profileDriverJournalDescription',
    href: '/driver-journal',
    icon: ClipboardCheck,
  },
  {
    id: 'routePlanner',
    nameKey: 'profileRoutePlanner',
    descriptionKey: 'profileRoutePlannerDescription',
    href: '/route-planner/map',
    icon: Map,
  },
] as const;

export default function ProfileContent({
  fullName,
  email,
  accessibleAppIds,
}: ProfileContentProps) {
  const { t } = useTranslations();

  const accessibleApps = apps.filter((app) =>
    accessibleAppIds.includes(app.id),
  );

  const initial = (fullName.charAt(0) || email.charAt(0) || 'U').toUpperCase();

  return (
    <main className="min-h-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('profileTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('profileSubtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{fullName}</h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    {t('profileActive')}
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    {t('profilePersonalInformation')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('profileAccountDetails')}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('profileFullName')}
                </p>
                <p className="mt-1 text-sm font-medium">{fullName}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('profileEmail')}
                </p>
                <p className="mt-1 truncate text-sm font-medium">{email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>

                <div>
                  <h2 className="font-semibold">{t('profileApplications')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('profileApplicationsDescription')}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {accessibleApps.map((app) => {
                  const Icon = app.icon;

                  return (
                    <Link
                      key={app.id}
                      href={app.href}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="size-5" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{t(app.nameKey)}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {t(app.descriptionKey)}
                        </p>
                      </div>

                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="min-w-0">
                <h2 className="font-semibold">{t('profileSignOut')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('profileSignOutDescription')}
                </p>
              </div>

              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
