import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </div>

          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            © {new Date().getFullYear()} FleetInspect
          </p>
        </div>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Smart fleet management
        </p>

        <p className="shrink-0 text-xs text-muted-foreground">
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
