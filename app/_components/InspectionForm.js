'use client';
import FormRow from './FormRow';
import { createUpdateInspection } from '../_lib/actions';
import Signature from './Signature';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import FormFieldRadio from './FormFieldRadio';
import FormFieldCheckbox from './FormFieldCheckbox';
import FormFieldImageUpload from './FormFieldImageUpload';
import FormFieldInput from './FormFieldInput';
import ErrorModal from './ErrorModal';
import ErrorMessages from './ErrorMessages';

export default function InspectionForm({
  questions,
  vehicle,
  user,
  trip,
  inspection = {},
}) {
  const [compressedImages, setCompressedImages] = useState({});
  const [signature, setSignature] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { id: editId, ...editValues } = inspection;

  const formattedTrip = trip
    ? trip
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (str) => str.toUpperCase())
    : '';

  const defaultValues = questions.reduce((values, field) => {
    values[field.name] = editId
      ? editValues?.[field.name]
      : field.type === 'file'
      ? ''
      : field.name === 'fullName'
      ? user?.name ?? ''
      : vehicle?.[field.name] ?? '';

    return values;
  }, {});

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  async function onSubmit(data) {
    const formDataToSubmit = new FormData();

    formDataToSubmit.append('vehicleId', vehicle?.id);
    formDataToSubmit.append('user_id', user?.userId);
    formDataToSubmit.append('trip', trip);
    formDataToSubmit.append('signature', signature);

    await Promise.all(
      Object.entries(data).map(async ([key, value]) => {
        if (value instanceof FileList && value.length > 0) {
          const compressedFile = compressedImages[key];
          formDataToSubmit.append(key, compressedFile || value[0]);
        } else {
          formDataToSubmit.append(key, value);
        }
      })
    );

    await createUpdateInspection(formDataToSubmit, editId ? editId : null);
  }

  function onError(errors) {
    setIsModalOpen(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="bg-white shadow-lg  max-w-3xl mx-auto flex flex-col gap-4 p-4 min-h-screen"
    >
      <h1 className="text-2xl font-bold  text-center">
        {formattedTrip} Vehicle Inspection
      </h1>

      {questions.map((field) => {
        const { label, name, option_sets, is_disabled, id, type } = field;
        const options = option_sets?.options || [];

        switch (type) {
          case 'radio':
            return (
              <FormRow key={id}>
                <FormFieldRadio
                  label={label}
                  name={name}
                  options={options}
                  register={register}
                  disabled={is_disabled}
                  error={errors[name]}
                />
              </FormRow>
            );
          case 'checkbox':
            return (
              <FormRow key={id}>
                <FormFieldCheckbox
                  label={label}
                  name={name}
                  options={options}
                  register={register}
                  disabled={is_disabled}
                  error={errors[name]}
                />
              </FormRow>
            );
          case 'file':
            return (
              <FormRow key={id}>
                <FormFieldImageUpload
                  type={type}
                  id={id}
                  label={label}
                  name={name}
                  register={register}
                  disabled={is_disabled}
                  editId={editId}
                  setCompressedImages={setCompressedImages}
                  error={errors[name]}
                  clearErrors={clearErrors}
                  setValue={setValue}
                />
              </FormRow>
            );
          default:
            return (
              <FormRow key={id}>
                <FormFieldInput
                  label={label}
                  id={id}
                  name={name}
                  type={field.type}
                  placeholder={field.placeholder}
                  register={register}
                  disabled={is_disabled}
                  error={errors[name]}
                />
              </FormRow>
            );
        }
      })}

      <Signature
        setSignature={setSignature}
        signature={signature}
        register={register}
        error={errors.signature}
        clearErrors={clearErrors}
        setValue={setValue}
      />

      <div className="flex justify-center m-6">
        <button
          disabled={isSubmitting}
          className={`bg-blue-500 text-white py-2 px-4 rounded-md shadow max-w-80 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {isModalOpen && (
        <ErrorModal onClose={() => setIsModalOpen(false)}>
          <ErrorMessages />
        </ErrorModal>
      )}
    </form>
  );
}
