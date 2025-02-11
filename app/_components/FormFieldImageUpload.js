'use client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { CameraIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { useState } from 'react';
import { compressImage } from '../_utils/helper';

const FormFieldImageUpload = ({
  label,
  name,
  id,
  type,
  register,
  editId,
  setCompressedImages,
  error,
  clearErrors,
  setValue,
}) => {
  const [preview, setPreview] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);

  const handleCaptureChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    clearErrors(name);

    const compressedBlob = await compressImage(selectedFile);

    const compressedFile = new File([compressedBlob], compressedBlob.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });

    setValue(name, compressedFile);

    setPreview(URL.createObjectURL(compressedFile));
    setCompressedImages((prevImages) => ({
      ...prevImages,
      [name]: compressedFile,
    }));
    setIsFileSelected(true);
  };

  return (
    <div className="flex gap-4 items-center w-full">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
      <div className="flex flex-col  border rounded-md px-3 py-3 border-gray-300 bg-white shadow-md w-full gap-2">
        <label
          htmlFor={id}
          className={`text-lg font-medium ${error ? 'text-danger-500' : ''} `}
        >
          {label}
        </label>

        <div className="flex justify-between px-6 items-center ">
          <label htmlFor={id} className="cursor-pointer flex-shrink-0">
            <CameraIcon className="h-7 w-7 text-gray-500" />
            <input
              type={type}
              id={id}
              name={name}
              {...register(name, {
                required:
                  !isFileSelected && !editId ? 'This field is required' : false,
              })}
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleCaptureChange}
            />
          </label>

          {preview && (
            <div className="relative w-[28px] h-[28px]">
              <Image
                src={preview}
                alt="Captured Photo"
                fill
                sizes="(max-width: 768px) 100vw, 112px"
                className="rounded-md shadow-md object-contain"
                quality={80}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormFieldImageUpload;
