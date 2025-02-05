import { auth } from '../_lib/auth';
import Logo from './Logo';
import SignIn from './SignIn';
import DropDown from './DropDown';
import Avatar from './Avatar';
import { Bars4Icon } from '@heroicons/react/24/outline';

const items = [
  { name: 'Profile', href: '/profile', id: 1 },
  { name: 'My Inspections', href: '/inspections', id: 2 },
  { name: 'Inspection', href: '/inspection', id: 3 },
];

async function Header() {
  const session = await auth();
  return (
    <header className="bg-primary-500 text-white flex items-center justify-between p-4">
      <Logo />
      {session?.user ? (
        <div className=" flex items-center gap-4  relative justify-center">
          <Avatar
            avatar={session?.user?.image}
            alt={session?.user?.name}
            height="34"
            width="34"
          />
          <DropDown items={items}>
            <Bars4Icon className="w-10 h-10 text-white fill-current" />
          </DropDown>
        </div>
      ) : (
        <SignIn />
      )}
    </header>
  );
}

export default Header;
