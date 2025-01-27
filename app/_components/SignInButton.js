import Image from 'next/image';
import { signInAction } from '../_lib/actions';

function SignInButton() {
  return (
    <form
      action={signInAction}
      className="max-w-md mx-auto space-y-6 flex flex-col items-center"
    >
      <button className="flex items-center gap-4 text-lg border border-primary-300 px-6 py-3 font-medium rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-300 transition duration-200 justify-center w-72 mt-6">
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          height="24"
          width="24"
          className="w-6 h-6"
        />
        <span className="text-primary-700">Sign In with Google</span>
      </button>
      <p className="text-center text-sm text-gray-600 leading-relaxed ">
        If your email is not already registered, a new account will be created
        automatically. We will store the following data: your name, email
        address, and profile picture. By clicking{' '}
        <strong>&apos;Sign In with Google&apos;</strong>, you consent to the
        creation of an account and the storage of your data in our system.
      </p>
    </form>
  );
}

export default SignInButton;
