import { auth } from '../_lib/auth';
import Logo from './Logo';
import SignIn from './SignIn';
import DropDown from './DropDown';
import Avatar from './Avatar';
import { Bars4Icon } from '@heroicons/react/24/outline';

const items = [
  { name: 'Profile', href: '/profile', id: 1 },
  { name: 'My Inspections', href: '/my_inspections', id: 2 },
];
const menu = [{ name: 'Inspections', href: '/inspection', id: 1 }];

async function Header() {
  const session = await auth();
  return (
    <header className="bg-primary-500 text-gray-100 py-2 flex items-center justify-between px-4">
      <Logo />
      {session?.user ? (
        <div className=" flex items-center gap-4  relative">
          <DropDown items={items} session={session}>
            <Avatar avatar={session?.user?.image} alt={session?.user?.name} />
          </DropDown>
          <DropDown items={menu} signOut={true}>
            <Bars4Icon />
          </DropDown>
        </div>
      ) : (
        <SignIn />
      )}
    </header>
  );
}

export default Header;
