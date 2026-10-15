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

            <DialogTitle>INSTALLATION INSTRUCTIONS</DialogTitle>

            <DialogDescription>
              If you wish to create an icon on your mobile or tablet for easy
              access you will need to do the following:
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-0 sm:py-2">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Android Device</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Click the 3 dots towards the top right hand corner of the
                screen, this will give you a menu, towards the bottom of the
                menu click the &apos;Install App&apos; option.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Apple IOS Device</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Click on the Share button icon (a square with an upward arrow)
                next to the URL bar. You can then select Add to Home Screen.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                Windows Phone or Desktop
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Click the 3 dots towards the bottom left corner of the screen,
                this will give you a menu, towards the bottom of the menu select
                &apos;pin to start&apos; this will add an icon to your home
                screen.
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
