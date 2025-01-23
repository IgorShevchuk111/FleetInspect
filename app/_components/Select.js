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
        <ListboxButton className="w-full text-left border hover:bg-gray-50  py-1 px-2 rounded-md shadow-sm  focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center">
          {options.find((opt) => opt.value === value)?.label || 'Select'}
          <ChevronDownIcon className="w-5 h-5 ml-2" />
        </ListboxButton>

        <ListboxOptions className="absolute w-full mt-1 bg-white border rounded-md shadow-md z-10">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="
                py-1 px-2 cursor-pointer
                 hover:bg-gray-50 rounded-md hover:text-gray-700
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
