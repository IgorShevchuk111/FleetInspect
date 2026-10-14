'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, ExternalLink, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppActionsProps {
  loginHref?: string;
}

export function InstallAppActions({
  loginHref = '/login',
}: InstallAppActionsProps) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      setInstructionsOpen(true);
      return;
    }

    const prompt = installPrompt;
    setInstallPrompt(null);

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;

      if (choice.outcome === 'dismissed') {
        setInstructionsOpen(true);
      }
    } catch {
      setInstructionsOpen(true);
    }
  }

  return (
    <>
      <div className="mt-7 flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleInstall}
        >
          <Download className="mr-2 size-4" />
          Install FleetInspect
        </Button>

        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={loginHref}>
            Skip for now
            <ExternalLink className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:h-auto sm:max-h-[85dvh] sm:max-w-md sm:gap-4 sm:rounded-lg sm:border sm:p-6">
          <DialogHeader className="shrink-0 border-b px-5 py-5 text-left sm:border-0 sm:px-0 sm:py-0">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="size-6" />
            </div>

            <DialogTitle>Install FleetInspect</DialogTitle>

            <DialogDescription>
              Add FleetInspect to your home screen for quick access to your
              applications.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-0 sm:py-2">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Android</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Open your browser menu using the three dots in the top-right
                corner. Select Install app, or Add to Home screen if that is the
                option available.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">iPhone or iPad</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Open this website in Safari. Tap Share (the square with an
                upward arrow), select Add to Home Screen, then tap Add.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Windows or desktop</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Look for the install icon in your browser&apos;s address bar, or
                open the browser menu and select Install app if available.
              </p>
            </section>
          </div>

          <div className="shrink-0 border-t bg-background px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:border-0 sm:px-0 sm:pt-0 sm:pb-0">
            <Button
              asChild
              className="w-full"
              onClick={() => setInstructionsOpen(false)}
            >
              <Link href={loginHref}>Continue to login</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
