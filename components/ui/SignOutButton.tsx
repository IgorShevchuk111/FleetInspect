'use client';

import { useTransition } from 'react';

import { LogOut } from 'lucide-react';

import { useSignOut } from '@/lib/auth/hooks/useSignOut';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const signOut = useSignOut();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut />
      {isPending ? t('signingOut') : t('profileSignOut')}
    </Button>
  );
}
