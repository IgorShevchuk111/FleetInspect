import { requireAppEntitlement } from '@/lib/auth/permissions';

export default async function RoutePlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppEntitlement('route_planner');

  return children;
}
