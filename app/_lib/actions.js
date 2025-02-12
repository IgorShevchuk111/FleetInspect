'use server';

import { redirect } from 'next/navigation';
import { supabase } from './supabase';
import { auth, signIn, signOut } from './auth';
import { getVehicles } from './data_servis';

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

export async function createUpdateInspection(formData, id) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const inspectionData = Object.fromEntries(formData.entries());

  const processedData = await Promise.all(
    Object.entries(inspectionData).map(async ([field, value]) => {
      if (value instanceof File && value.size > 0) {
        return [field, await uploadImage(value)];
      }
      return [field, value];
    })
  );

  const finalData = Object.fromEntries(processedData);

  let query = supabase.from('inspections');

  if (id) {
    query = query.update(finalData).eq('id', id);
  } else {
    query = query.insert([finalData]);
  }

  const { error } = await query.select().single();

  if (error) throw new Error('Error updating inspection vehicle.');

  redirect('/inspection/thankyou');
}

export async function searchVehicles(searchQuery) {
  const vehicles = await getVehicles();
  if (!searchQuery) return vehicles;

  return vehicles.filter((vehicle) =>
    vehicle.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
