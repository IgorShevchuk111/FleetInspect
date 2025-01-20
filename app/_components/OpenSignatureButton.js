import { PencilSquareIcon } from '@heroicons/react/24/outline';

function OpenSignatureButton({ onClick }) {
  return (
    <div className=" flex gap-4">
      <p className="text-sm font-medium">
        Sign - This vehicle is roadworthy and any defects found have been
        reported and repaired as nessesary. *
      </p>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-blue-500 hover:underline  "
      >
        <PencilSquareIcon className="h-5 w-5 text-blue-500" />
      </button>
    </div>
  );
}

export default OpenSignatureButton;
