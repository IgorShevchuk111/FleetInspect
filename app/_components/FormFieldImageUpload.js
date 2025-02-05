'use client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { CameraIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { useState } from 'react';

const FormFieldImageUpload = ({
  label,
  name,
  id,
  type,
  required,
  defaultValue,
}) => {
  const [preview, setPreview] = useState(defaultValue || '');
  const [file, setFile] = useState(null);

  const handleCaptureChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="flex gap-4 items-center w-full">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
      <div className="flex flex-col  border rounded-md px-3 py-3 border-gray-300 bg-white shadow-md w-full gap-2">
        <label htmlFor={id} className=" text-lg  font-medium">
          {label}
        </label>

        <div className="flex justify-between px-6 items-center ">
          <label htmlFor={id} className="cursor-pointer flex-shrink-0">
            <CameraIcon className="h-7 w-7 text-gray-500" />
            <input
              type={type}
              id={id}
              required={!preview && required}
              name={name}
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleCaptureChange}
            />
          </label>

          {(preview || defaultValue) && (
            <div className="relative w-[28px] h-[28px]">
              <Image
                src={preview || defaultValue}
                alt="Captured Photo"
                fill
                sizes="(max-width: 768px) 100vw, 112px"
                className="rounded-md shadow-md object-contain"
              />
            </div>
          )}
        </div>

        <input
          type="hidden"
          name={name}
          value={defaultValue ? defaultValue : file || ''}
        />
      </div>
    </div>
  );
};

export default FormFieldImageUpload;
