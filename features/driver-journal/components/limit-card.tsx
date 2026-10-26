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
  labelPosition?: string;
  warningAt?: number;
  successAt?: number;
};

export function LimitCard({
  title,
  count,
  current = '0:00',
  limits,
  locked = false,
  active = false,
  progress = 0,
  labelPosition = '-right-2 -top-[0.8rem]',
  warningAt,
  successAt,
}: LimitCardProps) {
  const words = title.split(' ');

  const progressColor =
    successAt !== undefined && progress >= successAt
      ? 'bg-success'
      : warningAt !== undefined && progress >= warningAt
        ? 'bg-warning'
        : 'bg-danger';

  return (
    <Card
      className={`relative min-h-20 overflow-hidden rounded-card shadow-card ${
        active ? 'ring-1 ring-border' : ''
      }`}
    >
      <CardContent className="grid min-h-20 grid-cols-[120px_minmax(4rem,.7fr)_minmax(0,1fr)] items-stretch gap-2 p-0">
        <div
          className={`relative flex min-w-0 flex-wrap items-center justify-center gap-2 px-2 py-4 text-center ${
            active ? `${progressColor} text-primary-foreground` : ''
          }`}
        >
          <span className="text-body  leading-tight underline decoration-1 underline-offset-4 ">
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
            <span className="whitespace-nowrap text-heading tabular-nums ">
              {current}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 px-3 py-4">
          {!locked &&
            limits?.map((limit, index) => (
              <div
                key={`${limit.value}-${index}`}
                className={`relative flex min-w-0 flex-col items-center ${
                  limit.good ? 'text-success' : ''
                }`}
              >
                <span className="whitespace-nowrap text-heading tabular-nums ">
                  {limit.remaining ?? limit.value}
                </span>

                <span className={`absolute ${labelPosition} text-caption`}>
                  {limit.value}
                </span>
              </div>
            ))}
        </div>
      </CardContent>

      {active && (
        <Progress
          value={Math.min(Math.max(progress, 0), 100)}
          indicatorClassName={progressColor}
          className="absolute bottom-0 left-[120px] h-2 w-[calc(100%-120px)] rounded-none bg-muted"
        />
      )}
    </Card>
  );
}
