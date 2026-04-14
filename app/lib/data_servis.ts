import { supabase } from '@/app/lib/supabase';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Vehicle = Tables['vehicles']['Row'];
type InspectionForm = Tables['form']['Row'];
type FleetInspection = Tables['fleet_inspections']['Row'];

type FleetInspectionWithVehicle = FleetInspection & {
  vehicle: {
    type: string;
    regnumber: string;
  };
};

type FleetInspectionWithVehicleAndUser = FleetInspection & {
  vehicle: {
    type: string;
    regnumber: string;
  };
  full_name: string;
};

const client = supabase as SupabaseClient<Database>;

export async function getUser(email: string): Promise<User | null> {
  const { data, error } = await client
    .from('users')
    .select()
    .eq('email', email)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createUser(userData: {
  id?: string;
  email: string;
  full_name: string;
  role?: string;
}) {
  try {
    const newUser = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role || 'user'
    };

    const { data, error } = await (client as any)
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        // User already exists, try to get existing user
        const { data: existingUser } = await client
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .single();

        return existingUser;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function findVehicle(regnumber: string): Promise<Vehicle[]> {
  try {
    if (!regnumber) {
      const { data, error } = await client
        .from('vehicles')
        .select()
        .order('regnumber', { ascending: true });

      if (error) {
        throw new Error('Error fetching all vehicles.');
      }

      return data || [];
    }

    const searchTerm = regnumber.trim();

    // Now perform the search with case-insensitive matching
    const { data: vehicles, error } = await client
      .from('vehicles')
      .select()
      .ilike('regnumber', `%${searchTerm}%`);

    if (error) {
      throw new Error('Error fetching vehicle.');
    }

    return vehicles || [];
  } catch (error) {
    throw error;
  }
}

export async function getInspectionForm(vehicleId: string, trip: string) {
  if (!vehicleId || !trip) {
    throw new Error('Vehicle Reg and Trip are required.');
  }

  // vehicleId is now a UUID string, not a number
  const { data: vehicle, error: vehicleError } = await client
    .from('vehicles')
    .select()
    .eq('id', vehicleId) // Use the UUID directly, no conversion needed
    .single();
  if (vehicleError || !vehicle) throw new Error('Error fetching vehicle.');

  // Simple query that should work
  const { data: inspectionForm, error } = await client
    .from('form')
    .select('*')
    .eq('hidden', false);
  if (error) {
    throw new Error(`Error fetching forms: ${error.message}`);
  }

  if (!inspectionForm || inspectionForm.length === 0) {
    throw new Error('No form fields found');
  }

  // Return all form fields, sorted by position
  const filteredForm = (inspectionForm as any[])
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  if (filteredForm.length === 0) {
    throw new Error(`No form fields found for vehicle type: ${(vehicle as any).type}`);
  }

  return { inspectionForm: filteredForm, vehicle };
}

export async function getUserInspections(userId: string): Promise<FleetInspectionWithVehicle[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data: inspections, error } = await client
    .from('fleet_inspections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch inspections');
  }

  // Now let's get the vehicles separately
  const vehicleIds = inspections?.map((insp: any) => insp.vehicle_id) || [];
  const { data: vehicles, error: vehiclesError } = await client
    .from('vehicles')
    .select('id, type, regnumber')
    .in('id', vehicleIds);

  if (vehiclesError) {
    throw new Error('Failed to fetch vehicle information');
  }

  // Create a map of vehicle data
  const vehicleMap = new Map((vehicles as any[])?.map(v => [v.id, v]) || []);

  // Combine the data
  const inspectionsWithVehicles = (inspections as any[])?.map(inspection => ({
    ...inspection,
    vehicle: vehicleMap.get(inspection.vehicle_id) || { type: 'unknown', regnumber: 'unknown' }
  })) || [];

  return inspectionsWithVehicles;
}

export async function getAllInspections(): Promise<FleetInspectionWithVehicleAndUser[]> {
  try {
    // First get all inspections
    const { data: inspections, error } = await client
      .from('fleet_inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch inspections');
    }

    if (!inspections || inspections.length === 0) {
      return [];
    }

    // Get unique vehicle IDs
    const vehicleIds = [...new Set((inspections as any[]).map(insp => insp.vehicle_id))];

    // Fetch vehicles
    const { data: vehicles, error: vehiclesError } = await client
      .from('vehicles')
      .select('id, type, regnumber')
      .in('id', vehicleIds);

    if (vehiclesError) {
    }

    // Create a map of vehicle data
    const vehicleMap = new Map((vehicles as any[])?.map(v => [v.id, v]) || []);

    // Combine the data - use full_name from inspection or fallback
    const transformedInspections = (inspections as any[]).map(inspection => ({
      ...inspection,
      vehicle: vehicleMap.get(inspection.vehicle_id) || {
        id: inspection.vehicle_id,
        type: 'unknown',
        regnumber: 'unknown'
      },
      full_name: inspection.full_name || 'Unknown Inspector'
    }));

    return transformedInspections;
  } catch (error) {
    throw new Error('Failed to fetch inspections');
  }
}

export async function getInspection(inspectionId: string) {
  if (!inspectionId) {
    throw new Error('Inspection ID is required');
  }

  // First get the inspection
  const { data: inspection, error: inspectionError } = await client
    .from('fleet_inspections')
    .select('*')
    .eq('id', inspectionId)
    .single();

  if (inspectionError) {
    throw new Error('Failed to fetch inspection');
  }

  if (!inspection) {
    throw new Error('Inspection not found');
  }

  // Then get the vehicle details
  const { data: vehicle, error: vehicleError } = await (client as any)
    .from('vehicles')
    .select('id, regnumber, type')
    .eq('id', (inspection as any).vehicle_id)
    .single();

  if (vehicleError) {
    throw new Error('Failed to fetch vehicle details');
  }

  // Combine the data
  const result = {
    ...(inspection as any),
    vehicle: vehicle || { id: 'unknown', regnumber: 'unknown', type: 'unknown' }
  };

  return result;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data: vehicles, error } = await client
    .from('vehicles')
    .select();

  if (error) throw new Error('Failed to fetch vehicles');

  return vehicles || [];
}

export async function searchVehicles(searchTerm: string): Promise<Vehicle[]> {
  try {
    const { data: vehicles, error } = await client
      .from('vehicles')
      .select();

    if (error) throw error;

    // Perform case-insensitive search across multiple fields
    const exactMatches = (vehicles as any[]).filter((vehicle: any) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        vehicle.regnumber.toLowerCase().includes(searchTermLower) ||
        vehicle.type.toLowerCase().includes(searchTermLower)
      );
    });

    return exactMatches;
  } catch (error) {
    throw error;
  }
}

export async function getVehicleById(vehicleId: string) {
  try {
    const { data: vehicle, error } = await client
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error) throw error;

    return vehicle;
  } catch (error) {
    throw error;
  }
}
