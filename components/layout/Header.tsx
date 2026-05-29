'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuItems,
  MenuItem,
  Transition,
  MenuButton,
} from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import { cn } from '@/lib/utils/cn';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { useSignOut } from '@/lib/auth/hooks/useSignOut';

const publicNavigation: any[] = [];

const privateNavigation = [
  // { name: 'Dashboard', href: '/' },
  { name: 'Inspections', href: '/inspections' },
  { name: 'Timesheets', href: '/timesheets' },
  { name: 'Reports', href: '/reports' },
];

const adminNavigation = [
  { name: 'All User Inspections', href: '/user-inspections' },
];

export default function Header() {
  const pathname = usePathname();
  const signOut = useSignOut();

  const supabase = createClient();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return null;

  const userRole = session?.user?.user_metadata?.role || 'user';
  const isAdmin = userRole === 'admin';

  const navigationItems = session
    ? [...privateNavigation, ...(isAdmin ? adminNavigation : [])]
    : publicNavigation;

  return (
    <Disclosure
      as="nav"
      className="bg-white shadow-sm dark:bg-background relative z-50"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Logo />
                </div>

                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200',
                          isActive
                            ? 'border-primary text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex sm:items-center">
                {session ? (
                  <Menu as="div" className="relative ml-3">
                    <MenuButton className="flex rounded-full bg-white text-sm">
                      <UserCircleIcon className="h-8 w-8" />
                    </MenuButton>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md p-1">
                        <MenuItem>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                          >
                            Your Profile
                          </Link>
                        </MenuItem>

                        <MenuItem>
                          <button
                            onClick={signOut}
                            className="block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </Menu>
                ) : (
                  <Link href="/login" className="text-primary">
                    Sign in
                  </Link>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                {session ? (
                  <DisclosureButton className="p-2">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </DisclosureButton>
                ) : (
                  <Link href="/login" className="text-sm">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden bg-white border-t">
            <div className="space-y-1 py-2">
              {navigationItems.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className="block px-4 py-2 text-sm"
                >
                  {item.name}
                </DisclosureButton>
              ))}

              {session && (
                <>
                  <DisclosureButton
                    as={Link}
                    href="/profile"
                    className="block px-4 py-2"
                  >
                    Profile
                  </DisclosureButton>

                  <DisclosureButton
                    as="button"
                    onClick={signOut}
                    className="block px-4 py-2"
                  >
                    Sign out
                  </DisclosureButton>
                </>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
