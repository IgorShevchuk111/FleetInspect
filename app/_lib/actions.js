'use server';

import { redirect } from 'next/navigation';
import { supabase } from './supabase';
import { signIn, signOut } from './auth';
import { convertBase64ToFile } from '../_utils/helpers';

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

  const imageName = `${Date.now()}-${file.name}`.replace(/\//g, '');

  const { data, error: uploadError } = await supabase.storage
    .from('inspections-images')
    .upload(imageName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { publicUrl } = supabase.storage
    .from('inspections-images')
    .getPublicUrl(data.path).data;

  return publicUrl;
};

const processInspectionData = async (formData) => {
  const inspectionData = Object.fromEntries(formData);

  const imageFields = [
    'offsideFront',
    'nearsideFront',
    'nearsideRear',
    'offsideRear',
    'signature',
  ];

  await Promise.all(
    imageFields.map(async (field) => {
      const value = formData.getAll(field);

      const file = value.find((v) => v instanceof File);
      const existingUrl = value.find((v) => typeof v === 'string');
      const signature = value.find(
        (v) => typeof v === 'string' && v.startsWith('data:image')
      );

      if (signature) {
        const fileToUpload = convertBase64ToFile(signature, 'signature.png');
        inspectionData[field] = await uploadImage(fileToUpload);
      } else if (file?.size > 0) {
        inspectionData[field] = await uploadImage(file);
      } else if (existingUrl) {
        inspectionData[field] = existingUrl;
      }
    })
  );

  return inspectionData;
};

export async function insertInspection(formData) {
  const inspectionData = await processInspectionData(formData);

  const { error } = await supabase.from('inspections').insert([inspectionData]);

  if (error) {
    console.error(error, 'insertInspection error');
    throw new Error('Error fetching vehicle.');
  }

  redirect('/inspection/thankyou');
}

export async function updateInspection(formData) {
  const inspectionData = await processInspectionData(formData);

  const { error } = await supabase
    .from('inspections')
    .update(inspectionData)
    .eq('id', inspectionData.id);

  if (error) throw new Error('Error updating form.');

  redirect('/inspection/thankyou');
}
