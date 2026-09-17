import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase/database';

type Tables = Database['public']['Tables'];
type FleetInspection = Tables['fleet_inspections']['Row'];
type Vehicle = Tables['vehicles']['Row'];


export type FleetInspectionWithVehicleAndUser = FleetInspection & {
    vehicle: {
        type: string;
        regnumber: string;
    };
    full_name: string;
};

export async function getAllInspections(
    userId?: string,
): Promise<FleetInspectionWithVehicleAndUser[]> {
    const supabase = await createClient()
    const baseQuery = supabase
        .from('fleet_inspections')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: inspections, error } = userId
        ? await baseQuery.eq('user_id', userId)
        : await baseQuery;

    if (error) throw new Error('Failed to fetch inspections');

    const typedInspections = (inspections ?? []) as FleetInspection[];

    const vehicleIds = [
        ...new Set(typedInspections.map((i) => i.vehicle_id)),
    ].filter(Boolean);

    const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, type, regnumber')
        .in('id', vehicleIds);

    if (vehiclesError) throw new Error('Failed to fetch vehicles');

    type VehicleMinimal = Pick<Vehicle, 'id' | 'type' | 'regnumber'>;

    const typedVehicles = (vehicles ?? []) as VehicleMinimal[];

    const vehicleMap = new Map<string, VehicleMinimal>();

    typedVehicles.forEach((v) => {
        vehicleMap.set(v.id, v);
    });

    return typedInspections.map((inspection) => {
        const vehicle = vehicleMap.get(inspection.vehicle_id);

        return {
            ...inspection,
            vehicle: {
                type: vehicle?.type ?? 'unknown',
                regnumber: vehicle?.regnumber ?? 'unknown',
            },
            full_name: (inspection as any).full_name ?? 'Unknown',
        };
    });
}

export async function getInspectionForm(vehicleId: string, trip: string) {

    if (!vehicleId || !trip) {
        throw new Error('Vehicle Reg and Trip are required.');
    }

    const supabase = await createClient()
    const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select()
        .eq('id', vehicleId) // Use the UUID directly, no conversion needed
        .single();
    if (vehicleError || !vehicle) throw new Error('Error fetching vehicle.');

    // Simple query that should work
    const { data: inspectionForm, error } = await supabase
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

export async function getUserInspections(userId: string): Promise<FleetInspectionWithVehicleAndUser[]> {
    if (!userId) {
        throw new Error('User ID is required');
    }
    const supabase = createClient()
    const { data: inspections, error } = await supabase
        .from('fleet_inspections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error('Failed to fetch inspections');
    }

    // Now let's get the vehicles separately
    const vehicleIds = inspections?.map((insp: any) => insp.vehicle_id) || [];
    const { data: vehicles, error: vehiclesError } = await supabase
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


export async function getInspection(inspectionId: string) {
    if (!inspectionId) {
        throw new Error('Inspection ID is required');
    }

    const supabase = await createClient()
    // First get the inspection
    const { data: inspection, error: inspectionError } = await supabase
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
    const { data: vehicle, error: vehicleError } = await (supabase as any)
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