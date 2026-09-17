export function InspectionCardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm">{children}</div>
  );
}
