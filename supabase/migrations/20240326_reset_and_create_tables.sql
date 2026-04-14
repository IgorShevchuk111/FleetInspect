-- First, drop all related tables to ensure a clean slate
DROP TABLE IF EXISTS public.fleet_inspections CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.form CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_vehicles_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_fleet_inspections_updated_at CASCADE;

-- Create vehicles table first (since it's referenced by fleet_inspections)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    regnumber TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_reg_number ON public.vehicles(regnumber);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON public.vehicles(type);

-- Create fleet_inspections table
CREATE TABLE IF NOT EXISTS public.fleet_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    trip TEXT NOT NULL CHECK (trip IN ('pre-trip', 'post-trip')),
    status TEXT NOT NULL CHECK (status IN ('Passed', 'Failed', 'Draft')),
    fullname TEXT NOT NULL,
    signature TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    images JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Create indexes for fleet_inspections
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_vehicle_id ON public.fleet_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_user_id ON public.fleet_inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_status ON public.fleet_inspections(status);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_trip ON public.fleet_inspections(trip);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_created_at ON public.fleet_inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_form_data ON public.fleet_inspections USING GIN (form_data);

-- Create form table
CREATE TABLE IF NOT EXISTS public.form (
    id TEXT PRIMARY KEY,
    hidden BOOLEAN NOT NULL DEFAULT false,
    vehicletype TEXT,
    trip TEXT CHECK (trip IN ('pre-trip', 'post-trip', NULL)),
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    label TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    placeholder TEXT,
    is_disabled BOOLEAN DEFAULT false,
    options JSONB,
    is_required BOOLEAN DEFAULT false
);

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles
CREATE POLICY "Enable read access for authenticated users" ON public.vehicles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.vehicles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.vehicles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS on fleet_inspections
ALTER TABLE public.fleet_inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for fleet_inspections
CREATE POLICY "Enable read access for authenticated users" ON public.fleet_inspections
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for own inspections" ON public.fleet_inspections
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own inspections" ON public.fleet_inspections
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own inspections" ON public.fleet_inspections
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicles_updated_at();

CREATE OR REPLACE FUNCTION update_fleet_inspections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fleet_inspections_updated_at
    BEFORE UPDATE ON public.fleet_inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_fleet_inspections_updated_at();

-- Insert some test vehicles
INSERT INTO public.vehicles (regnumber, type) VALUES
    ('ABC123', 'truck'),
    ('XYZ789', 'trailer'),
    ('DEF456', 'truck');

-- Insert default form fields
INSERT INTO form (id, label, name, type, placeholder, hidden, vehicletype, trip, position, is_required) VALUES
    ('ext1', 'Headlights', 'headlights', 'checkbox', NULL, false, NULL, NULL, 1, true),
    ('ext2', 'Taillights', 'taillights', 'checkbox', NULL, false, NULL, NULL, 2, true),
    ('ext3', 'Turn Signals', 'turn_signals', 'checkbox', NULL, false, NULL, NULL, 3, true),
    ('ext4', 'Mirrors', 'mirrors', 'checkbox', NULL, false, NULL, NULL, 4, true),
    ('ext5', 'Windshield', 'windshield', 'checkbox', NULL, false, NULL, NULL, 5, true),
    ('int1', 'Seatbelts', 'seatbelts', 'checkbox', NULL, false, NULL, NULL, 6, true),
    ('int2', 'Dashboard Lights', 'dashboard_lights', 'checkbox', NULL, false, NULL, NULL, 7, true),
    ('int3', 'Horn', 'horn', 'checkbox', NULL, false, NULL, NULL, 8, true),
    ('int4', 'Steering Wheel', 'steering_wheel', 'checkbox', NULL, false, NULL, NULL, 9, true),
    ('mech1', 'Brakes', 'brakes', 'checkbox', NULL, false, NULL, NULL, 10, true),
    ('mech2', 'Engine Oil', 'engine_oil', 'checkbox', NULL, false, NULL, NULL, 11, true),
    ('mech3', 'Transmission Fluid', 'transmission_fluid', 'checkbox', NULL, false, NULL, NULL, 12, true),
    ('mech4', 'Coolant Level', 'coolant_level', 'checkbox', NULL, false, NULL, NULL, 13, true); 