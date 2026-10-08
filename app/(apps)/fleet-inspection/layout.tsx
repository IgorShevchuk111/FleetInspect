import { requireAppEntitlement } from '@/lib/auth/permissions';

export default async function FleetInspectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppEntitlement('fleet_inspection');

  return children;
}
