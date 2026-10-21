import { getUser } from '@/lib/auth/auth';
import { createClient } from '@/lib/supabase/server';
import ProfileContent from '@/app/(platform)/profile/profile-content';

const apps = [
  {
    id: 'fleetInspection',
    name: 'Fleet Inspection',
    entitlement: 'fleet_inspection',
    description: 'Vehicle inspections, defects, photos and reports.',
    href: '/fleet-inspection/inspection',
  },
  {
    id: 'driverJournal',
    name: 'Driver Journal',
    description: 'Shifts, driving time, breaks, rest and working time.',
    href: '/driver-journal',
  },
  {
    id: 'routePlanner',
    name: 'Route Planner',
    entitlement: 'route_planner',
    description: 'Plan and manage your driving routes.',
    href: '/route-planner/map',
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

  return (
    <ProfileContent
      fullName={fullName}
      email={user.email ?? ''}
      accessibleAppIds={accessibleApps.map((app) => app.id)}
    />
  );
}
