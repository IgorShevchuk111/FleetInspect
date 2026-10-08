'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';

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

import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { useSignOut } from '@/lib/auth/hooks/useSignOut';

export default function Header() {
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

  return (
    <Disclosure
      as="nav"
      className="relative z-50 bg-white shadow-sm dark:bg-background"
    >
      {({ open }) => (
        <>
          <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Logo />
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
                      <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-white p-1 shadow-lg">
                        <MenuItem>
                          <Link
                            href="/profile"
                            className="block rounded-md px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Your Profile
                          </Link>
                        </MenuItem>

                        <MenuItem>
                          <button
                            onClick={signOut}
                            className="block w-full rounded-md px-4 py-2 text-left text-sm hover:bg-gray-100"
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

          <DisclosurePanel className="border-t bg-white sm:hidden">
            <div className="space-y-1 py-2">
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
