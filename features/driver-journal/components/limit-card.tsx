'use client';

import { useEffect, useRef, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LockKeyhole } from 'lucide-react';

import { useTranslations } from '../i18n/use-translations';

type LimitCardProps = {
  title: string;
  count?: number;
  current?: string;
  limits?: {
    value: string;
    label?: string;
    good?: boolean;
    remaining?: string;
    warningAt?: number;
    successAt?: number;
    dangerAt?: number;
  }[];
  locked?: boolean;
  active?: boolean;
  progress?: number;
  labelPosition?: string;
  warningAt?: number;
  successAt?: number;
  progressMode?: 'default' | 'working-day' | 'daily-driving';
  onClick?: () => void;
};

function parseDuration(value: string): number | null {
  const parts = value.trim().split(':').map(Number);

  if (parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  if (parts.length === 1) {
    return parts[0] * 60;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }

  return null;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  return `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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
  progressMode = 'default',
  onClick,
}: LimitCardProps) {
  const words = title.split(' ');
  const { t } = useTranslations();

  const progressTrackRef = useRef<HTMLDivElement>(null);
  const limitLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [markerPositions, setMarkerPositions] = useState<number[]>([]);

  // Measure the actual positions of limit labels.
  useEffect(() => {
    const updatePositions = () => {
      const track = progressTrackRef.current;

      if (!track) return;

      const trackRect = track.getBoundingClientRect();

      if (trackRect.width === 0) return;

      const positions = (limits ?? []).map((_, index) => {
        const label = limitLabelRefs.current[index];

        if (!label) return 0;

        const labelRect = label.getBoundingClientRect();

        const center = labelRect.left + labelRect.width / 2;

        return clamp(
          ((center - trackRect.left) / trackRect.width) * 100,
          0,
          100,
        );
      });

      setMarkerPositions((previous) => {
        const unchanged =
          previous.length === positions.length &&
          positions.every(
            (position, index) => Math.abs(position - previous[index]) < 0.1,
          );

        return unchanged ? previous : positions;
      });
    };

    updatePositions();

    const observer = new ResizeObserver(updatePositions);

    if (progressTrackRef.current) {
      observer.observe(progressTrackRef.current);
    }

    limitLabelRefs.current.forEach((label) => {
      if (label) observer.observe(label);
    });

    return () => observer.disconnect();
  }, [limits, labelPosition]);

  const clampedProgress = clamp(progress, 0, 100);

  // Map time progress to the actual positions of limit labels.
  const getMappedProgress = (): number => {
    if (!limits?.length || markerPositions.length !== limits.length) {
      return clampedProgress;
    }

    const parsedLimits = limits.map((limit) => parseDuration(limit.value));

    if (parsedLimits.some((value) => value === null)) {
      return clampedProgress;
    }

    const maxLimit = parsedLimits[parsedLimits.length - 1];

    if (!maxLimit || maxLimit <= 0) {
      return clampedProgress;
    }

    const currentMinutes = (clampedProgress / 100) * maxLimit;

    const points = [
      { minutes: 0, position: 0 },
      ...parsedLimits.map((minutes, index) => ({
        minutes: minutes as number,
        position: markerPositions[index],
      })),
    ];

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const next = points[index];

      if (currentMinutes <= next.minutes) {
        const duration = next.minutes - previous.minutes;

        if (duration <= 0) {
          return next.position;
        }

        const ratio = clamp(
          (currentMinutes - previous.minutes) / duration,
          0,
          1,
        );

        return previous.position + (next.position - previous.position) * ratio;
      }
    }

    return markerPositions[markerPositions.length - 1];
  };

  const mappedProgress = getMappedProgress();

  const progressColor =
    progressMode === 'working-day'
      ? progress >= 100
        ? 'bg-danger'
        : progress >= (warningAt ?? 100)
          ? 'bg-warning'
          : 'bg-success'
      : progressMode === 'daily-driving'
        ? progress >= 100
          ? 'bg-danger'
          : progress >= (warningAt ?? 90)
            ? 'bg-warning'
            : 'bg-success'
        : successAt !== undefined && progress >= successAt
          ? 'bg-success'
          : warningAt !== undefined && progress >= warningAt
            ? 'bg-warning'
            : 'bg-danger';

  const getLimitColor = (
    limit: NonNullable<LimitCardProps['limits']>[number],
  ) => {
    if (limit.dangerAt !== undefined && progress >= limit.dangerAt) {
      return 'text-danger';
    }

    if (limit.successAt !== undefined && progress >= limit.successAt) {
      return 'text-success';
    }

    if (limit.warningAt !== undefined && progress >= limit.warningAt) {
      return 'text-warning';
    }

    return limit.good ? 'text-success' : '';
  };

  // Keep the reached limit instead of displaying 0:00.
  const getRemaining = (
    limit: NonNullable<LimitCardProps['limits']>[number],
  ) => {
    const currentMinutes = parseDuration(current);
    const limitMinutes = parseDuration(limit.value);

    if (
      currentMinutes !== null &&
      limitMinutes !== null &&
      currentMinutes >= limitMinutes
    ) {
      return formatDuration(limitMinutes);
    }

    return limit.remaining ?? limit.value;
  };

  const card = (
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
          {/* <span className="text-body leading-tight underline decoration-1 underline-offset-4"> */}
          <span
            className={`text-body leading-tight ${
              onClick ? 'underline decoration-1 underline-offset-4' : ''
            }`}
          >
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
              aria-label={t('locked')}
            />
          ) : (
            <span className="whitespace-nowrap text-heading tabular-nums">
              {current}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 px-3 py-4">
          {!locked &&
            limits?.map((limit, index) => (
              <div
                key={`${limit.value}-${index}`}
                className={`relative flex min-w-0 flex-col items-center ${getLimitColor(limit)}`}
              >
                <span className="whitespace-nowrap text-heading tabular-nums">
                  {getRemaining(limit)}
                </span>

                <span
                  ref={(element) => {
                    limitLabelRefs.current[index] = element;
                  }}
                  className={`absolute ${labelPosition} text-caption`}
                >
                  {limit.value}
                </span>
              </div>
            ))}
        </div>
      </CardContent>

      {active && (
        <div
          ref={progressTrackRef}
          className="absolute bottom-0 left-[120px] h-2 w-[calc(100%-120px)]"
        >
          <Progress
            value={mappedProgress}
            indicatorClassName={progressColor}
            className="h-2 w-full rounded-none bg-muted"
          />
        </div>
      )}
    </Card>
  );

  if (!onClick) {
    return card;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Edit ${title}`}
    >
      {card}
    </button>
  );
}
