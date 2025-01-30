'use client';
import { CameraIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import React, { useState } from 'react';

const VehicleImageUpload = () => {
  const [image, setImage] = useState(null);

  const handleCaptureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="vehicleImage" className="cursor-pointer">
        <CameraIcon className="h-12 w-12 text-gray-500" />
        <input
          type="file"
          id="vehicleImage"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleCaptureChange}
        />
      </label>

      {image && (
        <Image
          src={image}
          alt="Captured Photo"
          className="mt-4 w-48 rounded-md shadow-md"
        />
      )}
    </div>
  );
};

export default VehicleImageUpload;
