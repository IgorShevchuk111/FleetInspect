'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';

const navigation = [
  {
    name: 'Inspections',
    href: '/fleet-inspection/inspections',
  },
  {
    name: 'Timesheets',
    href: '/fleet-inspection/timesheets',
  },
  {
    name: 'Reports',
    href: '/fleet-inspection/reports',
  },
];

type FleetInspectionNavigationProps = {
  isAdmin: boolean;
};

export default function FleetInspectionNavigation({
  isAdmin,
}: FleetInspectionNavigationProps) {
  const pathname = usePathname();

  const items = isAdmin
    ? [
        ...navigation,
        {
          name: 'All User Inspections',
          href: '/fleet-inspection/user-inspections',
        },
      ]
    : navigation;

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
