import { Toaster } from 'sonner';
import SignInWithEmailAndPassword from './SignInWithEmailAndPassword';
import SignInWithGoogleButton from './SignInWithGoogleButton';
import Link from 'next/link';

function LoginForm() {
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
          <div className="space-y-6 relative z-10">
            <SignInWithEmailAndPassword />
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
            <SignInWithGoogleButton />
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
