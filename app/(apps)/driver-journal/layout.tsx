import { requireAppEntitlement } from '@/lib/auth/permissions';

export default async function DriverJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppEntitlement('driver_journal');

  return children;
}
