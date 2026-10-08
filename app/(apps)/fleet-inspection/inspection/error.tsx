'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Vehicle not found</h1>

      <p className="text-muted-foreground">
        The vehicle could not be found. Please try again.
      </p>

      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
