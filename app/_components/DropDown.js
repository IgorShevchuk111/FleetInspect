import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
export default function DropDown({ items, children, user }) {
  return (
    <div>
      <Menu>
        <MenuButton className=" relative w-10 h-10 flex items-center justify-center">
          {children}
        </MenuButton>
        <MenuItems className="absolute right-[-10px] top-[40px] mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {items
            ?.filter(
              (item) => item.name !== 'Vehicles' || user?.role === 'admin'
            )
            .map((item) => (
              <MenuItem key={item.id}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-md "
                >
                  {item.name}
                </Link>
              </MenuItem>
            ))}

          <div className=" px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-md">
            <SignOutButton />
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
