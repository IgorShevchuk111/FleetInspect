import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase/database";

type Tables = Database['public']['Tables'];
type Vehicle = Tables['vehicles']['Row'];

export async function getVehicles(): Promise<Vehicle[]> {
    const supabase = await createClient()
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select();

    if (error) throw new Error('Failed to fetch vehicles');

    return vehicles || [];
}

export async function searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    try {
        const supabase = await createClient()
        const { data: vehicles, error } = await supabase
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
        const supabase = await createClient()
        const { data: vehicle, error } = await supabase
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