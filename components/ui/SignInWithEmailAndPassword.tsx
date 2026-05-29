'use client';

import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import SpinnerMini from './SpinnerMini';
import { useSignInWithPassword } from '@/lib/auth/hooks/useSignInWithPassword';

export default function SignInWithEmailAndPassword() {
  const { handleSubmit, isLoading, error } = useSignInWithPassword();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-secondary-foreground mb-1"
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
            className="block text-sm font-medium text-secondary-foreground mb-1"
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
              onClick={() => setShowPassword((prev) => !prev)}
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
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
