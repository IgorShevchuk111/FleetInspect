'use client';
import FormFieldCheckbox from './FormFieldCheckbox';
import FormFieldRadio from './FormFieldRadio';
import FormFieldInput from './FormFieldInput';
import FormFieldImageUpload from './FormFieldImageUpload';
export default function FormRow({ field, register, isEdit }) {
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

  switch (type) {
    case 'radio':
      return (
        <FormFieldRadio
          label={label}
          name={name}
          options={options}
          register={register}
          disabled={disabled}
        />
      );
    case 'checkbox':
      return (
        <FormFieldCheckbox label={label} name={name} register={register} />
      );
    case 'file':
      return (
        <FormFieldImageUpload
          label={label}
          name={name}
          id={id}
          type={type}
          register={register}
          isEdit={isEdit}
        />
      );
    default:
      return (
        <FormFieldInput
          label={label}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          register={register}
          disabled={disabled}
        />
      );
  }
}
