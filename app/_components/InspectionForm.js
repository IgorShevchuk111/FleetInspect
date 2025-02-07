'use client';
import FormRow from './FormRow';
import { insertInspection, updateInspection } from '../_lib/actions';
import Signature from './Signature';
import { useForm } from 'react-hook-form';
import { compressImage } from '../_utils/helper';

export default function InspectionForm({
  questions,
  vehicle,
  user,
  trip,
  inspection,
}) {
  const isEdit = Boolean(inspection);

  const formattedTrip = trip
    ? trip
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (str) => str.toUpperCase())
    : '';

  const defaultValues = questions.reduce((values, field) => {
    values[field.name] = isEdit
      ? inspection?.[field.name]
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
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  async function onSubmit(data) {
    const formData = new FormData();

    await Promise.all(
      Object.entries(data).map(async ([key, value]) => {
        if (value instanceof FileList && value.length > 0) {
          const compressedFile = await compressImage(value[0]);
          formData.append(key, compressedFile);
        } else {
          formData.append(key, value);
        }
      })
    );

    isEdit ? updateInspection(formData) : insertInspection(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-lg  max-w-3xl mx-auto flex flex-col gap-4 p-4 min-h-screen"
    >
      <h1 className="text-2xl font-bold  text-center">
        {formattedTrip} Vehicle Inspection
      </h1>

      {questions.map((field) => (
        <FormRow
          key={field.id}
          field={field}
          register={register}
          isEdit={isEdit}
        />
      ))}

      <Signature pendingLabel="Submiting..." />

      <input type="hidden" name="vehicleId" value={vehicle?.id} />
      <input type="hidden" name="user_id" value={user?.userId} />
      <input type="hidden" name="regNumber" value={vehicle?.regNumber} />
      <input type="hidden" name="fullName" value={user?.name} />
      <input type="hidden" name="vehicleType" value={vehicle?.type} />
      <input type="hidden" name="trip" value={trip} />
      {inspection && <input type="hidden" name="id" value={inspection?.id} />}
    </form>
  );
}
