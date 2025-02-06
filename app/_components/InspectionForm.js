'use client';
import FormRow from './FormRow';
import { insertInspection, updateInspection } from '../_lib/actions';
import Signature from './Signature';

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

  async function send(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const response = await (isEdit
      ? updateInspection(formData)
      : insertInspection(formData));
    console.log(response);

    if (response?.message) {
      alert(response.message || 'hhhhhhh');
      return;
    }
  }

  return (
    <form
      onSubmit={send}
      // action={isEdit ? updateInspection : insertInspection}
      className="bg-white shadow-lg  max-w-3xl mx-auto flex flex-col gap-4 p-4 min-h-screen"
    >
      <h1 className="text-2xl font-bold  text-center">
        {formattedTrip} Vehicle Inspection
      </h1>

      {questions.map((field) => (
        <FormRow
          key={field.id}
          field={field}
          defaultValue={defaultValues[field.name] || ''}
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
