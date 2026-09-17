import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Dumbbell, Map, Truck } from 'lucide-react';

import { getUser } from '@/lib/auth/auth';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const apps = [
  {
    name: 'Fleet Inspection',
    description: 'Vehicle inspections, defects, photos and reports.',
    href: '/fleet-inspection/inspection',
    icon: Truck,
  },
  {
    name: 'Driver Journal',
    description:
      'Record shifts, driving time, breaks, rest periods and working time in one place.',
    href: '/driver-journal',
    icon: ClipboardCheck,
  },
  {
    name: 'Route Planner',
    description: 'Plan and manage your driving routes efficiently.',
    href: '/routes',
    icon: Map,
  },
  {
    name: 'Fitness',
    description: 'Track workouts, nutrition and your progress.',
    href: '/fitness',
    icon: Dumbbell,
  },
];

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your tools. One workspace.
        </h1>

        <p className="mt-3 text-muted-foreground">
          Everything you need, organised in one place.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => {
          const Icon = app.icon;

          return (
            <Link
              key={app.name}
              href={user ? app.href : '/login'}
              className="group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <CardTitle>{app.name}</CardTitle>

                  <CardDescription className="leading-6">
                    {app.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-medium">Open application</span>

                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
