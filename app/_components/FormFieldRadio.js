import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function FormFieldRadio({
  label,
  name,
  options,
  disabled,
  register,
  error,
}) {
  return (
    <div className=" flex items-center gap-4  w-full">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />

      <div className="border rounded-md px-3 py-3 border-gray-300 bg-white shadow-md w-full flex flex-col gap-2  text-lg  font-medium">
        <h3 className={error ? 'text-red-500' : ''}>{label}</h3>
        <div className="flex gap-4">
          {options?.map((option) => (
            <label
              key={option.value}
              htmlFor={`${name}-${option.value}`}
              className="flex items-center"
            >
              <input
                id={`${name}-${option.value}`}
                type="radio"
                name={name}
                value={option.value}
                {...register(name, { required: 'This  field is required' })}
                className="mr-2"
                disabled={disabled}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
