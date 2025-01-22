'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function Select({ options, value, onChange, type, ...props }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="w-full text-left border-gray-300 bg-gray-100 py-2 px-3 rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center text-gray-700">
          {options.find((opt) => opt.value === value)?.label || 'Select'}
          <ChevronDownIcon className="w-5 h-5 ml-2" />
        </ListboxButton>

        <ListboxOptions className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md z-10">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="
                py-2 px-3 cursor-pointer
                 hover:bg-gray-200 hover:text-gray-700 : 'text-gray-700'
                "
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

export default Select;
