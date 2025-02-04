import { InformationCircleIcon } from '@heroicons/react/24/outline';

function FormFieldCheckbox({ label, name, required, defaultValue }) {
  return (
    <div className="flex gap-4 items-center">
      {name !== 'roadworthy' && (
        <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
      )}

      <div className="flex  gap-2 text-lg  font-medium">
        {label && <label htmlFor={name}>{label}</label>}
        <input
          type="checkbox"
          id={name}
          name={name}
          required={required}
          defaultChecked={defaultValue}
        />
      </div>
    </div>
  );
}

export default FormFieldCheckbox;
