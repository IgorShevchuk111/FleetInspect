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

import { getUser } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SignOutButton from '@/components/ui/SignOutButton';

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
    description: 'Shifts, driving time, breaks, rest and working time.',
    href: '/driver-journal',
    icon: ClipboardCheck,
  },
  {
    name: 'Route Planner',
    entitlement: 'route_planner',
    description: 'Plan and manage your driving routes.',
    href: '/route-planner/map',
    icon: Map,
  },
];

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('user_entitlements')
    .select('app')
    .eq('user_id', user.id);

  const entitlements = new Set(data?.map((item) => item.app) ?? []);

  const accessibleApps = apps.filter(
    (app) => !app.entitlement || entitlements.has(app.entitlement),
  );

  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || 'Your account';

  const email = user.email ?? '';

  const initial = (fullName.charAt(0) || email.charAt(0) || 'U').toUpperCase();

  return (
    <main className="min-h-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and applications.
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
                    Active
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
                  <h2 className="font-semibold">Personal information</h2>
                  <p className="text-sm text-muted-foreground">
                    Your account details.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Full name
                </p>
                <p className="mt-1 text-sm font-medium">{fullName}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
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
                  <h2 className="font-semibold">Applications</h2>
                  <p className="text-sm text-muted-foreground">
                    Applications available to your account.
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
                      key={app.name}
                      href={app.href}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="size-5" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {app.description}
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
                <h2 className="font-semibold">Sign out</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign out of your FleetInspect account.
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
