'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import Logo from '../ui/Logo';

const publicNavigation = [];

const privateNavigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Inspections', href: '/inspections' },
  { name: 'Timesheets', href: '/timesheets' },
  { name: 'Reports', href: '/reports' },
];

const adminNavigation = [
  { name: 'All User Inspections', href: '/user-inspections' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, data: session } = useSession();

  // Get user role from session
  const userRole = session?.user?.role || 'user';
  const isAdmin = userRole === 'admin';

  const navigationItems =
    status === 'authenticated'
      ? [
          ...publicNavigation,
          ...privateNavigation,
          ...(isAdmin ? adminNavigation : []),
        ]
      : publicNavigation;

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/login',
    });
  };

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
                          'inline-flex items-center px-1 pt-1 text-sm font-medium',
                          'border-b-2 transition-colors duration-200',
                          isActive
                            ? 'border-primary text-foreground dark:border-primary dark:text-white'
                            : 'border-transparent text-muted-foreground hover:border-border hover:text-secondary-foreground dark:text-muted-foreground dark:hover:text-muted-foreground'
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {status === 'authenticated' ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white dark:bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <UserCircleIcon className="h-8 w-8 text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={cn(
                                active ? 'bg-primary-50 dark:bg-muted' : '',
                                'block px-4 py-2 text-sm text-secondary-foreground dark:text-muted-foreground'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={cn(
                                active ? 'bg-primary-50 dark:bg-muted' : '',
                                'block w-full text-left px-4 py-2 text-sm text-secondary-foreground dark:text-muted-foreground'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    href="/login"
                    className="text-primary hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                {status === 'authenticated' ? (
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-primary-50 hover:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-primary hover:text-foreground dark:text-muted-foreground dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-ring500 focus:ring-offset-2"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-background shadow-lg border-t border-border dark:border-border z-[9999]">
            <div className="space-y-1 pb-3 pt-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={cn(
                      'block py-2 pl-3 pr-4 text-base font-medium border-l-4',
                      isActive
                        ? 'border-primary bg-primary-50 text-secondary-foreground dark:border-primary dark:bg-primary/10 dark:text-muted-foreground'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-primary-50 hover:text-secondary-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
            {status === 'authenticated' && (
              <div className="border-t border-border dark:border-border pb-3 pt-4">
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:bg-primary-50 hover:text-secondary-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:bg-primary-50 hover:text-secondary-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
