import FleetInspectionNavigation from '@/features/fleet-inspection/components/FleetInspectionNavigation';
import { getUser } from '@/lib/auth/auth';
import { requireAppEntitlement } from '@/lib/auth/permissions';

export default async function FleetInspectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppEntitlement('fleet_inspection');

  const user = await getUser();
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <>
      <FleetInspectionNavigation isAdmin={isAdmin} />
      {children}
    </>
  );
}
