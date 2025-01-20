import Question from './Question';
import { inspectionAction } from '../_lib/actions';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function InspectionForm({ questions, vehicle, user, trip }) {
  const formattedTrip = trip
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase());

  const defaultValues = {
    regNumber: vehicle.regNumber,
    mileage: vehicle.mileage || '',
    fullName: user?.name,
  };

  return (
    <form action={inspectionAction}>
      <div className=" bg-gray-100 min-h-screen">
        <div className="bg-white shadow-lg rounded-lg  max-w-lg mx-auto flex flex-col gap-4 p-4 ">
          <h1 className="text-xl font-bold  text-center">
            {formattedTrip} Vehicle Walk Around Inspection
          </h1>

          <div className="flex gap-4 items-center">
            <span className="text-blue-500 cursor-pointer">
              <InformationCircleIcon className="h-6 w-6" />
            </span>
            <label htmlFor="fitToDrive">Fit to drive declaration *</label>
            <input type="checkbox" required name="fitToDrive" id="fitToDrive" />
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
              type="checkbox"
              className="ml-4"
              required
              name="roadworthy"
            />
          </label>

          <div className="flex justify-center mt-4">
            <button className="bg-blue-500 text-white py-2 px-4 rounded-md shadow max-w-80">
              Submit
            </button>
          </div>
        </div>
      </div>

      <input type="hidden" name="vehicleId" value={vehicle.id} />
      <input type="hidden" name="type" value={vehicle.type} />
      <input type="hidden" name="user_id" value={user?.userId} />
      <input type="hidden" name="regNumber" value={vehicle.regNumber} />
      <input type="hidden" name="vehicleType" value={vehicle.type} />
      <input type="hidden" name="trip" value={trip} />
    </form>
  );
}
