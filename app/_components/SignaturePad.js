import SignatureCanvas from 'react-signature-canvas';
import React, { useRef } from 'react';

function Signature({ setSignature, setShowSignaturePad, showSignaturePad }) {
  const sigPad = useRef(null);
  if (!showSignaturePad) return null;

  function handleClear() {
    sigPad.current.clear();
    setSignature('');
  }

  function handleSave() {
    const dataURL = sigPad.current.toDataURL();

    const isEmpty = sigPad.current.isEmpty();
    if (!isEmpty) {
      setSignature(dataURL);
      setShowSignaturePad((prev) => !prev);
    }
  }
  return (
    <div className="border border-gray-300 rounded-md p-2 mt-4">
      <SignatureCanvas
        ref={sigPad}
        penColor="black"
        canvasProps={{
          width: 300,
          height: 150,
          className: 'sigCanvas',
        }}
      />
      <div className="flex  mt-2 justify-evenly">
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-700 text-white py-1 px-2 rounded-md shadow"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-500 text-white py-1 px-2 rounded-md shadow"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}

export default Signature;
