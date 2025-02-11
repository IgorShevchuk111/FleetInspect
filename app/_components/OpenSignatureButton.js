import { PencilSquareIcon } from '@heroicons/react/24/outline';

function OpenSignatureButton({ onClick, error }) {
  return (
    <div className=" flex gap-4 items-center">
      <p
        className={`${
          error ? 'text-danger-500 text-sm font-medium' : 'text-sm font-medium'
        }`}
      >
        By signing, you confirm that all identified defects have been reported
        and repaired as necessary. *
      </p>

      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-blue-500 hover:underline  "
      >
        <PencilSquareIcon className="h-9 w-9 text-blue-500" />
      </button>
    </div>
  );
}

export default OpenSignatureButton;
