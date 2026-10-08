import { requireAuthentication } from '@/lib/auth/permissions';

export default async function DriverJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthentication();

  return children;
}
