'use client';

import { useTransition } from 'react';
import { useSignOut } from '@/lib/auth/hooks/useSignOut';

function SignOutButton() {
  const signOut = useSignOut();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="px-4 py-2 text-muted-foreground hover:bg-primary-50 rounded-md cursor-pointer"
      onClick={() => startTransition(() => signOut())}
    >
      {isPending ? 'Signing out...' : 'Sign out'}
    </div>
  );
}

export default SignOutButton;
