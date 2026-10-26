'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LockKeyhole } from 'lucide-react';

type LimitCardProps = {
  title: string;
  count?: number;
  current?: string;
  limits?: {
    value: string;
    label?: string;
    good?: boolean;
    remaining?: string;
  }[];
  locked?: boolean;
  active?: boolean;
  progress?: number;
};

export function LimitCard({
  title,
  count,
  current = '0:00',
  limits,
  locked = false,
  active = false,
  progress = 0,
}: LimitCardProps) {
  const words = title.split(' ');

  return (
    <Card
      className={`relative min-h-20 overflow-hidden rounded-card shadow-card ${
        active ? 'ring-1 ring-border' : ''
      }`}
    >
      <CardContent className="grid min-h-20 grid-cols-[120px_minmax(4rem,.7fr)_minmax(0,1fr)] items-stretch gap-2 p-0">
        <div
          className={`relative flex min-w-0 flex-wrap items-center justify-center gap-2 px-2 py-4 text-center ${
            active ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          <span className="text-body  leading-tight underline decoration-1 underline-offset-4 sm:text-heading">
            {words[0]}
            {words.length > 1 && (
              <>
                <br />
                {words.slice(1).join(' ')}
              </>
            )}
          </span>

          {count !== undefined && (
            <Badge
              variant="outline"
              className="absolute right-1 top-2 size-5 min-w-5 justify-center rounded-full p-0 text-caption"
            >
              {count}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center px-1">
          {locked ? (
            <LockKeyhole
              className="size-8 text-muted-foreground"
              aria-label="Заблоковано"
            />
          ) : (
            <span className="whitespace-nowrap text-heading tabular-nums sm:text-title">
              {current}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-3 py-4">
          {!locked &&
            limits?.map((limit, index) => (
              <div
                key={`${limit.value}-${index}`}
                className={`relative flex min-w-0 flex-col items-center ${
                  limit.good ? 'text-success' : ''
                }`}
              >
                <span className="whitespace-nowrap text-heading tabular-nums sm:text-title">
                  {limit.remaining ?? limit.value}
                </span>

                <span className="absolute -right-2 -top-[0.8rem] text-caption">
                  {limit.value}
                </span>
              </div>
            ))}
        </div>
      </CardContent>

      {active && (
        <Progress
          value={Math.min(progress, 100)}
          className="absolute bottom-0 left-0 h-2 rounded-none"
        />
      )}
    </Card>
  );
}
