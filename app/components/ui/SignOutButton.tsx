'use client';

import { useTransition } from 'react';
import { signOutAction } from '@/app/lib/actions';

function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="px-4 py-2 text-muted-foreground hover:bg-primary-50 rounded-md cursor-pointer"
      onClick={() => startTransition(() => signOutAction())}
    >
      {isPending ? 'Signing out...' : 'Sign out'}
    </div>
  );
}

export default SignOutButton;
