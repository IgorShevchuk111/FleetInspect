import Question from './Question';
import { insertInspection, updateInspection } from '../_lib/actions';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Signature from './Signature';

export default function InspectionForm({
  questions,
  vehicle,
  user,
  trip,
  inspection,
}) {
  const formattedTrip = trip
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase());

  const defaultValues = questions.reduce((values, field) => {
    values[field.name] =
      inspection?.[field.name] || vehicle?.[field.name] || user?.name || '';
    return values;
  }, {});

  return (
    <form action={inspection ? updateInspection : insertInspection}>
      <div className=" bg-gray-100 min-h-screen">
        <div className="bg-white shadow-lg  max-w-3xl mx-auto flex flex-col gap-4 p-4 ">
          <h1 className="text-2xl font-bold  text-center">
            {formattedTrip} Vehicle Inspection
          </h1>

          <div className="flex gap-4 items-center">
            <span className="text-blue-500 cursor-pointer">
              <InformationCircleIcon className="h-6 w-6" />
            </span>
            <label htmlFor="fitToDrive">Fit to drive declaration *</label>
            <input
              defaultChecked={inspection?.fitToDrive}
              type="checkbox"
              required
              name="fitToDrive"
              id="fitToDrive"
            />
          </div>

          {questions.map((field) => (
            <Question
              key={field.id}
              field={field}
              defaultValue={defaultValues[field.name] || ''}
            />
          ))}

          <h3 className="text-lg font-semibold">Roadworthy Declaration</h3>
          <label className="text-sm font-medium ">
            I confirm that the vehicle is roadworthy and all checks have been
            completed. *
            <input
              defaultChecked={inspection?.roadworthy}
              type="checkbox"
              className="ml-4"
              required
              name="roadworthy"
            />
          </label>
          <Signature pendingLabel="Submiting..." />
        </div>
      </div>

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
