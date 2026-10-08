'use client';

import { useTransition } from 'react';

import { LogOut } from 'lucide-react';

import { useSignOut } from '@/lib/auth/hooks/useSignOut';

import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const signOut = useSignOut();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut />
      {isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
