'use client';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
export default function DropDown({ items, children, signOut }) {
  return (
    <div>
      <Menu>
        <MenuButton className=" relative w-6 h-6">{children}</MenuButton>
        <MenuItems className="absolute right-[-10px] top-[30px] mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {items?.map((item) => (
            <MenuItem key={item.id}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md "
              >
                {item.name}
              </Link>
            </MenuItem>
          ))}
          {signOut && (
            <div className=" px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
              <SignOutButton />
            </div>
          )}
        </MenuItems>
      </Menu>
    </div>
  );
}
