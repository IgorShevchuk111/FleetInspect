'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import SpinnerMini from './SpinnerMini';

function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignInWithEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      try {
        await signIn('credentials', {
          email,
          password,
          redirect: true,
          callbackUrl: '/',
        });
        // If we reach here, the redirect should have happened automatically
      } catch (error) {
        console.error('Sign in error:', error);
        setError('Sign-in failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <form className="space-y-4" onSubmit={handleSignInWithEmail}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-30">
              <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue="user@example.com"
              placeholder="Enter your email"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-30">
              <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              defaultValue="123456"
              placeholder="Enter your password"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center z-30"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
              ) : (
                <EyeIcon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <SpinnerMini />
          ) : (
            <>
              <LockClosedIcon className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border dark:border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-card text-muted-foreground dark:text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border dark:border-border rounded-lg shadow-sm bg-white dark:bg-muted text-sm font-medium text-secondary-foreground dark:text-muted-foreground hover:bg-primary-50 dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring500 transition-colors duration-200"
      >
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          height="20"
          width="20"
          className="w-5 h-5"
        />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}

export default SignInButton;
