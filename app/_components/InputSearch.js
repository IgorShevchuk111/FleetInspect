import { findVehicle } from '../_lib/actions';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function InputSearch() {
  return (
    <form action={findVehicle}>
      <div className=" relative ">
        <label htmlFor="search" className="flex flex-col items-center gap-3 ">
          <h1 className="text-3xl font-bold">Vehicle inspection</h1>
          <div className=" flex justify-center gap-8 text-lg">
            <label className=" flex gap-2 ">
              <input type="radio" name="trip" value="preTrip" required />
              Pre Trip
            </label>
            <label className=" flex gap-2">
              <input type="radio" name="trip" value="postTrip" required />
              Post Trip
            </label>
          </div>
          <input
            type="text"
            id="search"
            name="regNumber"
            placeholder="Enter KTR80 or BN23KLL"
            className="w-full border rounded-md p-2 outline-gray-300  mb-3"
          />
        </label>

        <button>
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-6  transform -translate-y-1/2  top-[110px]" />
        </button>
      </div>
    </form>
  );
}

export default InputSearch;
