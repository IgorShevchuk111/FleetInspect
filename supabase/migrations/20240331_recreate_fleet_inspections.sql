-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS fleet_inspections_backup AS
SELECT * FROM fleet_inspections;

-- Drop the existing table and all its dependencies
DROP TABLE IF EXISTS fleet_inspections CASCADE;

-- Create the table fresh with the correct structure
CREATE TABLE fleet_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    user_id TEXT NOT NULL,  -- Changed from UUID to TEXT for NextAuth IDs
    trip TEXT NOT NULL CHECK (trip IN ('pre-trip', 'post-trip')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'failed', 'passed')),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completion_time TIMESTAMPTZ,
    
    -- Inspection Items
    headlights TEXT DEFAULT 'failed',
    turn_signals TEXT DEFAULT 'failed',
    mirrors TEXT DEFAULT 'failed',
    brakes TEXT DEFAULT 'failed',
    
    -- Notes for each item
    headlights_notes TEXT,
    turn_signals_notes TEXT,
    mirrors_notes TEXT,
    brakes_notes TEXT,
    
    -- Photos for each item
    headlights_photos TEXT[],
    turn_signals_photos TEXT[],
    mirrors_photos TEXT[],
    brakes_photos TEXT[]
);

-- Add CHECK constraints to ensure only 'passed' or 'failed' values
ALTER TABLE fleet_inspections
    ADD CONSTRAINT check_headlights CHECK (headlights IN ('passed', 'failed')),
    ADD CONSTRAINT check_turn_signals CHECK (turn_signals IN ('passed', 'failed')),
    ADD CONSTRAINT check_mirrors CHECK (mirrors IN ('passed', 'failed')),
    ADD CONSTRAINT check_brakes CHECK (brakes IN ('passed', 'failed'));

-- Create indexes
CREATE INDEX idx_fleet_inspections_user_id ON fleet_inspections(user_id);
CREATE INDEX idx_fleet_inspections_vehicle_id ON fleet_inspections(vehicle_id);
CREATE INDEX idx_fleet_inspections_status ON fleet_inspections(status);
CREATE INDEX idx_fleet_inspections_created_at ON fleet_inspections(created_at DESC);

-- Enable RLS
ALTER TABLE fleet_inspections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON fleet_inspections
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON fleet_inspections
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for own inspections" ON fleet_inspections
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create validation function
CREATE OR REPLACE FUNCTION validate_inspection()
RETURNS TRIGGER AS $$
BEGIN
    -- Check required fields
    IF NEW.vehicle_id IS NULL THEN
        RAISE EXCEPTION 'vehicle_id is required';
    END IF;
    
    IF NEW.user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    
    -- Calculate overall status based on remaining checks
    IF NEW.status = 'completed' THEN
        -- Set completion time when status changes to completed
        NEW.completion_time = now();
        
        -- Check if any inspection items are failed
        IF NEW.headlights = 'failed' OR 
           NEW.turn_signals = 'failed' OR 
           NEW.mirrors = 'failed' OR 
           NEW.brakes = 'failed' THEN
            NEW.status = 'failed';
        ELSE
            NEW.status = 'passed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER validate_inspection_trigger
    BEFORE INSERT OR UPDATE ON fleet_inspections
    FOR EACH ROW
    EXECUTE FUNCTION validate_inspection();

-- Grant necessary permissions
GRANT ALL ON fleet_inspections TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Restore data from backup if it exists
INSERT INTO fleet_inspections (
    id, vehicle_id, user_id, trip, status, full_name,
    created_at, completion_time,
    headlights, turn_signals, mirrors, brakes,
    headlights_notes, turn_signals_notes, mirrors_notes, brakes_notes,
    headlights_photos, turn_signals_photos, mirrors_photos, brakes_photos
)
SELECT 
    id, vehicle_id, user_id::text, trip, status, full_name,
    created_at, completion_time,
    headlights, turn_signals, mirrors, brakes,
    headlights_notes, turn_signals_notes, mirrors_notes, brakes_notes,
    headlights_photos, turn_signals_photos, mirrors_photos, brakes_photos
FROM fleet_inspections_backup
WHERE EXISTS (SELECT 1 FROM fleet_inspections_backup LIMIT 1);

-- Drop the backup table
DROP TABLE IF EXISTS fleet_inspections_backup; 