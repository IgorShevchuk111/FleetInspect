import { InformationCircleIcon } from '@heroicons/react/24/outline';

function FormFieldInput({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  disabled,
  register,
}) {
  return (
    <div className="flex gap-4 items-center w-full">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
      <div className="border rounded-md px-3 py-3 border-gray-300 bg-white shadow-md w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="font-medium">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          name={name}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          disabled={disabled}
          {...register(name, { required: 'This  field is required' })}
        />
      </div>
    </div>
  );
}

export default FormFieldInput;
