import { supabase } from './supabase';

export async function getUser(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  return data;
}

export async function createUser(newUser) {
  const { data, error } = await supabase.from('users').insert([newUser]);

  if (error) throw new Error('User could not be created');

  return data;
}

export async function getInspectionForm(vehicleId, trip) {
  if (!vehicleId || !trip) {
    throw new Error('Vehicle Reg and Trip are required.');
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single();
  if (vehicleError) throw new Error('Error fetching vehicle.');

  const { data: inspectionForm, error } = await supabase
    .from('form')
    .select(
      `
    *,
    option_sets (
      options (label, value)
    )
  `
    )
    .or(`vehicleType.eq.${vehicle.type},vehicleType.is.null`)
    .or(`trip.eq.${trip},trip.is.null`)
    .order('position', { ascending: true });
  if (error) throw new Error('Error Fetching Inspection Form Fields.');

  return { inspectionForm, vehicle };
}
