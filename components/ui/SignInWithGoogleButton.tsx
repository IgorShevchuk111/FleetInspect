'use client';

import { useSignInWithGoogle } from '@/lib/auth/hooks/useSignInWithGoogle';
import Image from 'next/image';
import React from 'react';

export default function SignInWithGoogleButton() {
  const { signInWithGoogle, error, isLoading } = useSignInWithGoogle();

  return (
    <>
      <button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border dark:border-border rounded-lg shadow-sm bg-white dark:bg-muted text-sm font-medium text-secondary-foreground dark:text-muted-foreground hover:bg-primary-50 dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring500 transition-colors duration-200"
      >
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          height={20}
          width={20}
          className="w-5 h-5"
        />

        <span>Sign in with Google</span>
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </>
  );
}
