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
    .eq('hidden', false)
    .or(`vehicleType.eq.${vehicle.type},vehicleType.is.null`)
    .or(`trip.eq.${trip},trip.is.null`)
    .order('position', { ascending: true });
  if (error) throw new Error('Error Fetching Inspection Form Fields.');

  return { inspectionForm, vehicle };
}

export async function getUserInspections(userId) {
  let { data: inspections, error } = await supabase
    .from('inspections')
    .select('regNumber, created_at, status, trip,id, vehicle:vehicles(type)')
    .eq('user_id', userId);

  if (error) throw new Error('Failed to fetch inspections');

  return inspections;
}

export async function getInspection(inspectionId) {
  let { data: inspection, error } = await supabase
    .from('inspections')
    .select('*, user_id(full_name,id)')
    .eq('id', inspectionId)
    .single();

  if (error) throw new Error('Failed to edit');

  return inspection;
}

export async function getVehicles() {
  const { data: vehicles, error } = await supabase.from('vehicles').select('*');

  if (error) throw new Error('Failed to fetch vehicles');

  return vehicles;
}
