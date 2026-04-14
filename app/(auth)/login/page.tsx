import SignInButton from '../../components/ui/SignInButton';
import Link from 'next/link';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Login',
  description: 'Login page',
};

export default function Page() {
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
            Welcome back
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
      </div>

      <div className="mt-2 sm:mt-6 mx-auto w-full max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-xl border border-gray-200">
          <SignInButton />

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
