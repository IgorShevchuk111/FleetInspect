'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';
import { createUser } from '@/app/lib/data_servis';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  // Check for email parameter and error message on component mount
  useEffect(() => {
    const email = searchParams.get('email');
    const error = searchParams.get('error');
    const test = searchParams.get('test');

    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }

    // If this is a test user, pre-fill the form
    if (test === 'true') {
      setFormData({
        email: email || 'user@example.com',
        password: '123456',
        confirmPassword: '123456',
        fullName: 'Test User',
      });
    }

    if (error === 'user_not_found' && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info('Account not found', {
        description: 'Please create a new account to continue.',
      });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.fullName
    ) {
      toast.error('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');

    try {
      // First, check if user already exists in Supabase Auth

      const { data: existingUser, error: checkError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      // If user exists in Auth but we're here, it means they don't exist in our database
      if (existingUser.user && !checkError) {
        // Sign out first
        await supabase.auth.signOut();

        // Create the user in our database using the existing auth user ID
        await createUser({
          id: existingUser.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: 'user',
        });

        toast.dismiss(loadingToast);
        toast.success('Account completed successfully!', {
          description: 'Your account has been set up. You can now sign in.',
        });

        // Redirect to login
        router.push('/login');
        return;
      }

      // If user doesn't exist in Auth, create new account

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        // Handle auth error silently
        toast.error('Failed to create account', {
          description: 'Please try again.',
        });
        return;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Then create the user in our database
      await createUser({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        role: 'user',
      });

      toast.dismiss(loadingToast);
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.',
      });

      // Sign in the user automatically
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Account created but sign-in failed', {
          description: 'Please try signing in manually.',
        });
        router.push('/login');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {
      // Handle error silently
      toast.dismiss(loadingToast);
      toast.error('Failed to create account', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col pt-8 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 relative z-0">
      <Toaster
        position="top-right"
        richColors
        closeButton
        className="!top-20"
      />

      <div className="mx-auto w-full max-w-md sm:mt-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Join us to get started
          </p>
        </div>
      </div>

      <div className="mt-2 sm:mt-6 mx-auto w-full max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-xl border border-gray-200 relative z-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-30">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
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
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-30"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-30">
                  <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-colors duration-200 relative z-20"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-30"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
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
                'Creating account...'
              ) : (
                <>
                  <UserIcon className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Image
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google logo"
                  height="20"
                  width="20"
                  className="w-5 h-5"
                />
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-900">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
