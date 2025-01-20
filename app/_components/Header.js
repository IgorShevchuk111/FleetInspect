import { auth } from '../_lib/auth';
import SignOutButton from './SignOutButton';
import Logo from './Logo';
import Avatar from './Avatar';
import SignIn from './SignIn';

async function Header() {
  const session = await auth();
  return (
    <header className="bg-primary-500 text-gray-100 py-2 flex items-center justify-between px-4">
      <Logo />
      {session?.user ? (
        <div className=" flex items-center gap-4">
          <Avatar />
          <SignOutButton />
        </div>
      ) : (
        <SignIn />
      )}
    </header>
  );
}

export default Header;
