'use client';

import SignatureCanvas from 'react-signature-canvas';
import React, { useRef, useState } from 'react';
import OpenSignatureButton from './OpenSignatureButton';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { compressImage, convertBase64ToFile } from '../_utils/helper';

function Signature({ setSignature, signature }) {
  const [showSignature, setShowSignature] = useState(false);
  const [previewSignature, setPreviewSignature] = useState(false);
  const sigPad = useRef(null);

  function handleClear() {
    sigPad.current.clear();
    setSignature('');
  }

  async function handleSave() {
    const dataURL = sigPad.current.toDataURL();

    const isEmpty = sigPad.current.isEmpty();
    if (!isEmpty) {
      setPreviewSignature(dataURL);
      const convertedSignature = convertBase64ToFile(dataURL, 'signature.png');

      const compressedSignatureBlob = await compressImage(convertedSignature);
      const compressedSignatureFile = new File(
        [compressedSignatureBlob],
        compressedSignatureBlob.name,
        {
          type: compressedSignatureBlob.type,
          lastModified: Date.now(),
        }
      );
      setSignature(compressedSignatureFile);
      setShowSignature((prev) => !prev);
    }
  }

  function handleOpenSignature() {
    setShowSignature((prev) => !prev);
  }
  return (
    <>
      <OpenSignatureButton
        onClick={handleOpenSignature}
        signature={signature}
      />
      {signature && (
        <div className="relative w-20 h-20 m-auto">
          <Image
            src={previewSignature}
            alt="Signature"
            fill
            sizes="(max-width: 768px) 24px, (max-width: 1200px) 32px, 48px"
          />
        </div>
      )}
      {showSignature && (
        <div className="border border-gray-300 rounded-md p-2 max-w-[325px] m-auto">
          <SignatureCanvas
            ref={sigPad}
            required={true}
            penColor="black"
            canvasProps={{
              width: 325,
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
      )}

      {/* <input type="hidden" name="signature" value={signature} /> */}
    </>
  );
}

export default Signature;
