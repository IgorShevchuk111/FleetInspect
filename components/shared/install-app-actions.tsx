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

import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

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
  const { t } = useTranslations();

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
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
          {t('installAppDescription')}
        </p>

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleInstall}
        >
          <Download className="mr-2 size-4" />
          {t('installApp')}
        </Button>

        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={loginHref}>
            {t('skipForNow')}
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

            <DialogTitle>{t('installationInstructions')}</DialogTitle>

            <DialogDescription>
              {t('installationDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-0 sm:py-2">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('androidDevice')}</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                {t('androidInstructions')}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('iosDevice')}</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                {t('iosInstructions')}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('desktopDevice')}</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                {t('desktopInstructions')}
              </p>
            </section>
          </div>

          <div className="shrink-0 border-t bg-background px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:border-0 sm:px-0 sm:pt-0 sm:pb-0">
            <Button asChild className="w-full">
              <Link href={loginHref} onClick={() => setInstructionsOpen(false)}>
                {t('continueToLogin')}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
