import SignInButton from '../_components/SignInButton';

export const metadata = {
  title: 'Login',
};

export default function Page() {
  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-3xl font-semibold">Sign in to your account</h2>
      <SignInButton />
    </div>
  );
}
