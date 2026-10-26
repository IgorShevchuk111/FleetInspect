import { getUser } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';

import HomeContent from '@/app/(platform)/home-content';

const apps = [
  {
    id: 'fleetInspection',
    entitlement: 'fleet_inspection',
    href: '/fleet-inspection/inspection',
  },
  {
    id: 'driverJournal',
    href: '/tachograph',
  },
  {
    id: 'routePlanner',
    entitlement: 'route_planner',
    href: '/route-planner/map',
  },
];

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

  const accessDenied = params.error === 'access_denied' && Boolean(params.app);

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

  return (
    <HomeContent
      isAuthenticated={Boolean(user)}
      accessibleAppIds={accessibleApps.map((app) => app.id)}
      accessDenied={Boolean(accessDenied)}
      deniedAppId={params.app ?? ''}
    />
  );
}
