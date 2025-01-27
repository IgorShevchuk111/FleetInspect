'use server';

import { redirect } from 'next/navigation';
import { supabase } from './supabase';
import { signIn, signOut } from './auth';

export async function findVehicle(formData) {
  const regNumber = formData.get('regNumber');
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

export async function insertInspection(formData) {
  const inspectionData = {};

  formData.forEach((value, key) => {
    inspectionData[key] = value;
  });

  const { error } = await supabase.from('inspections').insert([inspectionData]);

  if (error) {
    throw new Error('Error submiting form.');
  }

  redirect('/inspection/thankyou');
}

export async function updateInspection(formData) {
  const inspectionData = {};

  formData.forEach((value, key) => {
    inspectionData[key] = value;
  });

  const { error } = await supabase
    .from('inspections')
    .update(inspectionData)
    .eq('id', inspectionData.id);

  if (error) throw new Error('Error submiting  form.');

  redirect('/inspection/thankyou');
}

export async function signInAction() {
  await signIn('google', { redirectTo: '/inspection' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
