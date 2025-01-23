import { InformationCircleIcon } from '@heroicons/react/24/outline';

const Question = ({ field, defaultValue }) => {
  const {
    label,
    id,
    name,
    type,
    placeholder,
    is_disabled: disabled,
    is_required: required,
    option_sets,
  } = field;
  const options = option_sets?.options || [];

  return (
    <div className=" flex  gap-4 items-center">
      <span className=" text-blue-500 cursor-pointer">
        <InformationCircleIcon className="h-6 w-6" />
      </span>
      <div className="border rounded-md px-4 py-4 border-gray-300 bg-white shadow-md w-full flex flex-col gap-2">
        {type === 'radio' ? (
          <fieldset>
            <legend className="text-sm font-medium mb-2">{label}</legend>
            <div className="flex gap-4">
              {options?.map((option) => (
                <label key={option.value} htmlFor={`${name}-${option.value}`}>
                  <input
                    id={`${name}-${option.value}`}
                    type="radio"
                    name={name}
                    value={option.value}
                    defaultChecked={option.value === defaultValue}
                    className="mr-2"
                    required={required}
                    disabled={disabled}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <>
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
            <input
              type={type}
              id={id}
              name={name}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              defaultValue={defaultValue}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Question;
