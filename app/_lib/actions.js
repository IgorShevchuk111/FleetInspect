'use server';

import { redirect } from 'next/navigation';
import { supabase } from './supabase';
import { auth, signIn, signOut } from './auth';
import sharp from 'sharp';

export async function findVehicle(formData) {
  const regNumber = formData.get('regNumber').trim();
  const trip = formData.get('trip');

  if (!regNumber || !trip) return;

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .ilike('regNumber', regNumber)
    .single();

  if (error) throw new Error('Error fetching vehicle.');

  const queryParams = new URLSearchParams({
    trip: trip,
  });

  redirect(`/inspection/${vehicle.id}?${queryParams}`);
}

export async function signInAction() {
  await signIn('google', { redirectTo: '/inspection' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

const uploadImage = async (file) => {
  if (!file) return null;

  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1e6);
  const imageName = `${timestamp}-${randomNumber}-${file.name.replace(
    /\//g,
    ''
  )}`;

  const { data, error: uploadError } = await supabase.storage
    .from('inspections-images')
    .upload(imageName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw new Error('Failed to upload image');

  const { publicUrl } = supabase.storage
    .from('inspections-images')
    .getPublicUrl(data.path).data;

  return publicUrl;
};

const processInspectionData = async (compressedFiles) => {
  const inspectionData = {};

  const handleFileUpload = async (field, value) => {
    const file = value instanceof File ? value : null;
    const existingUrl = typeof value === 'string' ? value : null;
    const signature =
      typeof value === 'string' && value.startsWith('data:image')
        ? value
        : null;

    if (signature) {
      const fileToUpload = convertBase64ToFile(signature, `${field}.png`);
      return await uploadImage(fileToUpload);
    }

    if (file?.size > 0) {
      return await uploadImage(file);
    }

    if (existingUrl) {
      return existingUrl;
    }

    return null;
  };

  await Promise.all(
    Object.keys(compressedFiles).map(async (field) => {
      const value = compressedFiles[field];
      inspectionData[field] = await handleFileUpload(field, value);
    })
  );

  return inspectionData;
};

const compressFiles = async (formData) => {
  const compressedFiles = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size === 0) {
        continue;
      }
      const buffer = await value.arrayBuffer();
      const compressedBuffer = await sharp(Buffer.from(buffer))
        .resize({ width: 1024 })
        .jpeg({ quality: 70 })
        .toBuffer();

      compressedFiles[key] = new File([compressedBuffer], value.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } else {
      compressedFiles[key] = value;
    }
  }

  return compressedFiles;
};

const convertBase64ToFile = (base64String, filename) => {
  const base64Data = base64String.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    byteArrays.push(byteCharacters.charCodeAt(offset));
  }
  const byteArray = new Uint8Array(byteArrays);
  return new File([byteArray], filename, { type: 'image/png' });
};

export async function insertInspection(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const compressedFiles = await compressFiles(formData);

  const inspectionData = await processInspectionData(compressedFiles);

  const { error } = await supabase.from('inspections').insert([inspectionData]);

  if (error) {
    console.log(error.message);
    return error;
  }

  if (error) throw new Error('Error inspection vehicle.');

  redirect('/inspection/thankyou');
}

export async function updateInspection(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const compressedFiles = await compressFiles(formData);

  const inspectionData = await processInspectionData(compressedFiles);

  const { data, error } = await supabase
    .from('inspections')
    .update(inspectionData)
    .eq('id', inspectionData.id);

  if (error) {
    console.log(error.message);
    return error;
  }

  redirect('/inspection/thankyou');
}
