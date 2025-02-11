import { InformationCircleIcon } from '@heroicons/react/24/outline';

function FormFieldCheckbox({ label, name, register, error }) {
  return (
    <div className="flex gap-4 items-center">
      {name !== 'roadworthy' && (
        <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
      )}

      <div className="flex  gap-2 text-lg  font-medium">
        {label && (
          <label htmlFor={name} className={error ? 'text-red-500' : ''}>
            {label}
          </label>
        )}
        <input
          type="checkbox"
          id={name}
          name={name}
          {...register(name, { required: 'This  field is required' })}
        />
      </div>
    </div>
  );
}

export default FormFieldCheckbox;
