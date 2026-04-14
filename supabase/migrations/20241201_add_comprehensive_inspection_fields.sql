-- Add comprehensive inspection fields to fleet_inspections table
-- This migration adds all form fields that are currently in the UI but missing from the database

-- First, add all the missing checkbox fields
ALTER TABLE fleet_inspections
ADD COLUMN IF NOT EXISTS time_start_value TEXT,
ADD COLUMN IF NOT EXISTS time_finish_value TEXT,
ADD COLUMN IF NOT EXISTS odo_reading_start_value TEXT,
ADD COLUMN IF NOT EXISTS odo_reading_finish_value TEXT,
ADD COLUMN IF NOT EXISTS tachograph_serviceable TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS tacho_spare_paper TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS driver_cpc_card TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fluid_levels TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS lights TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS horn_bleeper_cameras TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS windscreen TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS tyres TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS wheels_nuts_indicators TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fuel_tanks TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS external_equipment TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS height_indicator TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS height_value TEXT,
ADD COLUMN IF NOT EXISTS operators_licence TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS load_secured TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS air_leaks TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS advanced_systems TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fifth_wheel_slider TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS trailer_docs TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS landing_legs TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS cables TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS load_bed TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS load_area_clean TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fridge_systems TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fridge_temp_settings TEXT DEFAULT 'failed',
ADD COLUMN IF NOT EXISTS fridge_temp_start TEXT,
ADD COLUMN IF NOT EXISTS tail_lift TEXT DEFAULT 'failed';

-- Add CHECK constraints for checkbox fields
ALTER TABLE fleet_inspections
ADD CONSTRAINT IF NOT EXISTS check_tachograph_serviceable CHECK (tachograph_serviceable IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_tacho_spare_paper CHECK (tacho_spare_paper IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_driver_cpc_card CHECK (driver_cpc_card IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_fluid_levels CHECK (fluid_levels IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_lights CHECK (lights IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_horn_bleeper_cameras CHECK (horn_bleeper_cameras IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_windscreen CHECK (windscreen IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_tyres CHECK (tyres IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_wheels_nuts_indicators CHECK (wheels_nuts_indicators IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_fuel_tanks CHECK (fuel_tanks IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_external_equipment CHECK (external_equipment IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_height_indicator CHECK (height_indicator IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_operators_licence CHECK (operators_licence IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_load_secured CHECK (load_secured IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_air_leaks CHECK (air_leaks IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_advanced_systems CHECK (advanced_systems IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_fifth_wheel_slider CHECK (fifth_wheel_slider IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_trailer_docs CHECK (trailer_docs IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_landing_legs CHECK (landing_legs IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_cables CHECK (cables IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_load_bed CHECK (load_bed IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_load_area_clean CHECK (load_area_clean IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_fridge_systems CHECK (fridge_systems IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_fridge_temp_settings CHECK (fridge_temp_settings IN ('passed', 'failed')),
ADD CONSTRAINT IF NOT EXISTS check_tail_lift CHECK (tail_lift IN ('passed', 'failed'));

-- Add notes columns for all checkbox fields
ALTER TABLE fleet_inspections
ADD COLUMN IF NOT EXISTS tachograph_serviceable_notes TEXT,
ADD COLUMN IF NOT EXISTS tacho_spare_paper_notes TEXT,
ADD COLUMN IF NOT EXISTS driver_cpc_card_notes TEXT,
ADD COLUMN IF NOT EXISTS fluid_levels_notes TEXT,
ADD COLUMN IF NOT EXISTS lights_notes TEXT,
ADD COLUMN IF NOT EXISTS horn_bleeper_cameras_notes TEXT,
ADD COLUMN IF NOT EXISTS windscreen_notes TEXT,
ADD COLUMN IF NOT EXISTS tyres_notes TEXT,
ADD COLUMN IF NOT EXISTS wheels_nuts_indicators_notes TEXT,
ADD COLUMN IF NOT EXISTS fuel_tanks_notes TEXT,
ADD COLUMN IF NOT EXISTS external_equipment_notes TEXT,
ADD COLUMN IF NOT EXISTS height_indicator_notes TEXT,
ADD COLUMN IF NOT EXISTS operators_licence_notes TEXT,
ADD COLUMN IF NOT EXISTS load_secured_notes TEXT,
ADD COLUMN IF NOT EXISTS air_leaks_notes TEXT,
ADD COLUMN IF NOT EXISTS advanced_systems_notes TEXT,
ADD COLUMN IF NOT EXISTS fifth_wheel_slider_notes TEXT,
ADD COLUMN IF NOT EXISTS trailer_docs_notes TEXT,
ADD COLUMN IF NOT EXISTS landing_legs_notes TEXT,
ADD COLUMN IF NOT EXISTS cables_notes TEXT,
ADD COLUMN IF NOT EXISTS load_bed_notes TEXT,
ADD COLUMN IF NOT EXISTS load_area_clean_notes TEXT,
ADD COLUMN IF NOT EXISTS fridge_systems_notes TEXT,
ADD COLUMN IF NOT EXISTS fridge_temp_settings_notes TEXT,
ADD COLUMN IF NOT EXISTS tail_lift_notes TEXT;

-- Add photos columns for all checkbox fields
ALTER TABLE fleet_inspections
ADD COLUMN IF NOT EXISTS tachograph_serviceable_photos TEXT[],
ADD COLUMN IF NOT EXISTS tacho_spare_paper_photos TEXT[],
ADD COLUMN IF NOT EXISTS driver_cpc_card_photos TEXT[],
ADD COLUMN IF NOT EXISTS fluid_levels_photos TEXT[],
ADD COLUMN IF NOT EXISTS lights_photos TEXT[],
ADD COLUMN IF NOT EXISTS horn_bleeper_cameras_photos TEXT[],
ADD COLUMN IF NOT EXISTS windscreen_photos TEXT[],
ADD COLUMN IF NOT EXISTS tyres_photos TEXT[],
ADD COLUMN IF NOT EXISTS wheels_nuts_indicators_photos TEXT[],
ADD COLUMN IF NOT EXISTS fuel_tanks_photos TEXT[],
ADD COLUMN IF NOT EXISTS external_equipment_photos TEXT[],
ADD COLUMN IF NOT EXISTS height_indicator_photos TEXT[],
ADD COLUMN IF NOT EXISTS operators_licence_photos TEXT[],
ADD COLUMN IF NOT EXISTS load_secured_photos TEXT[],
ADD COLUMN IF NOT EXISTS air_leaks_photos TEXT[],
ADD COLUMN IF NOT EXISTS advanced_systems_photos TEXT[],
ADD COLUMN IF NOT EXISTS fifth_wheel_slider_photos TEXT[],
ADD COLUMN IF NOT EXISTS trailer_docs_photos TEXT[],
ADD COLUMN IF NOT EXISTS landing_legs_photos TEXT[],
ADD COLUMN IF NOT EXISTS cables_photos TEXT[],
ADD COLUMN IF NOT EXISTS load_bed_photos TEXT[],
ADD COLUMN IF NOT EXISTS load_area_clean_photos TEXT[],
ADD COLUMN IF NOT EXISTS fridge_systems_photos TEXT[],
ADD COLUMN IF NOT EXISTS fridge_temp_settings_photos TEXT[],
ADD COLUMN IF NOT EXISTS tail_lift_photos TEXT[];

-- Update the validation function to include all the new fields
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
    
    -- Calculate overall status based on all checkbox checks
    IF NEW.status = 'completed' THEN
        -- Set completion time when status changes to completed
        NEW.completion_time = now();
        
        -- Check if any inspection items are failed
        IF NEW.headlights = 'failed' OR 
           NEW.turn_signals = 'failed' OR 
           NEW.mirrors = 'failed' OR 
           NEW.brakes = 'failed' OR
           NEW.tachograph_serviceable = 'failed' OR
           NEW.tacho_spare_paper = 'failed' OR
           NEW.driver_cpc_card = 'failed' OR
           NEW.fluid_levels = 'failed' OR
           NEW.lights = 'failed' OR
           NEW.horn_bleeper_cameras = 'failed' OR
           NEW.windscreen = 'failed' OR
           NEW.tyres = 'failed' OR
           NEW.wheels_nuts_indicators = 'failed' OR
           NEW.fuel_tanks = 'failed' OR
           NEW.external_equipment = 'failed' OR
           NEW.height_indicator = 'failed' OR
           NEW.operators_licence = 'failed' OR
           NEW.load_secured = 'failed' OR
           NEW.air_leaks = 'failed' OR
           NEW.advanced_systems = 'failed' OR
           NEW.fifth_wheel_slider = 'failed' OR
           NEW.trailer_docs = 'failed' OR
           NEW.landing_legs = 'failed' OR
           NEW.cables = 'failed' OR
           NEW.load_bed = 'failed' OR
           NEW.load_area_clean = 'failed' OR
           NEW.fridge_systems = 'failed' OR
           NEW.fridge_temp_settings = 'failed' OR
           NEW.tail_lift = 'failed' THEN
            NEW.status = 'failed';
        ELSE
            NEW.status = 'passed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create/replace the trigger
DROP TRIGGER IF EXISTS validate_inspection_trigger ON fleet_inspections;
CREATE TRIGGER validate_inspection_trigger
    BEFORE INSERT OR UPDATE ON fleet_inspections
    FOR EACH ROW
    EXECUTE FUNCTION validate_inspection();

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_tachograph ON fleet_inspections(tachograph_serviceable);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_driver_card ON fleet_inspections(driver_cpc_card);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_fluid_levels ON fleet_inspections(fluid_levels);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_lights ON fleet_inspections(lights);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_windscreen ON fleet_inspections(windscreen);
CREATE INDEX IF NOT EXISTS idx_fleet_inspections_tyres ON fleet_inspections(tyres);

-- Add comment for documentation
COMMENT ON TABLE fleet_inspections IS 'Fleet inspections table with comprehensive inspection fields for pre-trip and post-trip checks'; 