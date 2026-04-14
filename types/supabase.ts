export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    role: string
                    created_at?: string
                    updated_at?: string
                }
                Insert: {
                    id?: string
                    email: string
                    full_name: string
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            vehicles: {
                Row: {
                    id: string
                    regnumber: string
                    type: string
                    created_at?: string
                    updated_at?: string
                }
                Insert: {
                    id?: string
                    regnumber: string
                    type: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    regnumber?: string
                    type?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            form: {
                Row: {
                    id: string
                    label: string
                    name: string
                    type: string
                    placeholder?: string
                    is_disabled: boolean
                    options?: Record<string, any>
                    is_required: boolean
                    position: number
                    hidden: boolean
                    vehicletype?: string
                    trip?: 'pre-trip' | 'post-trip' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    label: string
                    name: string
                    type: string
                    placeholder?: string
                    is_disabled?: boolean
                    options?: Record<string, any>
                    is_required?: boolean
                    position: number
                    hidden?: boolean
                    vehicletype?: string
                    trip?: 'pre-trip' | 'post-trip' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    label?: string
                    name?: string
                    type?: string
                    placeholder?: string
                    is_disabled?: boolean
                    options?: Record<string, any>
                    is_required?: boolean
                    position?: number
                    hidden?: boolean
                    vehicletype?: string
                    trip?: 'pre-trip' | 'post-trip' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            fleet_inspections: {
                Row: {
                    id: string
                    vehicle_id: string
                    user_id: string
                    status: 'draft' | 'completed' | 'failed' | 'passed'
                    created_at: string
                    completion_time: string | null
                    trip: 'pre-trip' | 'post-trip'
                    signature: string | null
                    full_name?: string | null
                    // Value fields
                    time_start_value: string | null
                    time_finish_value: string | null
                    odo_reading_start_value: string | null
                    odo_reading_finish_value: string | null
                    height_value: string | null
                    fridge_temp_start: string | null
                    // Inspection Items (Checkbox fields)
                    headlights: 'passed' | 'failed' | null
                    turn_signals: 'passed' | 'failed' | null
                    mirrors: 'passed' | 'failed' | null
                    brakes: 'passed' | 'failed' | null
                    tachograph_serviceable: 'passed' | 'failed' | null
                    tacho_spare_paper: 'passed' | 'failed' | null
                    driver_cpc_card: 'passed' | 'failed' | null
                    fluid_levels: 'passed' | 'failed' | null
                    lights: 'passed' | 'failed' | null
                    horn_bleeper_cameras: 'passed' | 'failed' | null
                    windscreen: 'passed' | 'failed' | null
                    tyres: 'passed' | 'failed' | null
                    wheels_nuts_indicators: 'passed' | 'failed' | null
                    fuel_tanks: 'passed' | 'failed' | null
                    external_equipment: 'passed' | 'failed' | null
                    height_indicator: 'passed' | 'failed' | null
                    operators_licence: 'passed' | 'failed' | null
                    load_secured: 'passed' | 'failed' | null
                    air_leaks: 'passed' | 'failed' | null
                    advanced_systems: 'passed' | 'failed' | null
                    fifth_wheel_slider: 'passed' | 'failed' | null
                    trailer_docs: 'passed' | 'failed' | null
                    landing_legs: 'passed' | 'failed' | null
                    cables: 'passed' | 'failed' | null
                    load_bed: 'passed' | 'failed' | null
                    load_area_clean: 'passed' | 'failed' | null
                    fridge_systems: 'passed' | 'failed' | null
                    fridge_temp_settings: 'passed' | 'failed' | null
                    tail_lift: 'passed' | 'failed' | null
                    // Notes
                    headlights_notes: string | null
                    turn_signals_notes: string | null
                    mirrors_notes: string | null
                    brakes_notes: string | null
                    tachograph_serviceable_notes: string | null
                    tacho_spare_paper_notes: string | null
                    driver_cpc_card_notes: string | null
                    fluid_levels_notes: string | null
                    lights_notes: string | null
                    horn_bleeper_cameras_notes: string | null
                    windscreen_notes: string | null
                    tyres_notes: string | null
                    wheels_nuts_indicators_notes: string | null
                    fuel_tanks_notes: string | null
                    external_equipment_notes: string | null
                    height_indicator_notes: string | null
                    operators_licence_notes: string | null
                    load_secured_notes: string | null
                    air_leaks_notes: string | null
                    advanced_systems_notes: string | null
                    fifth_wheel_slider_notes: string | null
                    trailer_docs_notes: string | null
                    landing_legs_notes: string | null
                    cables_notes: string | null
                    load_bed_notes: string | null
                    load_area_clean_notes: string | null
                    fridge_systems_notes: string | null
                    fridge_temp_settings_notes: string | null
                    tail_lift_notes: string | null
                    // Photos
                    headlights_photos: string[] | null
                    turn_signals_photos: string[] | null
                    mirrors_photos: string[] | null
                    brakes_photos: string[] | null
                    tachograph_serviceable_photos: string[] | null
                    tacho_spare_paper_photos: string[] | null
                    driver_cpc_card_photos: string[] | null
                    fluid_levels_photos: string[] | null
                    lights_photos: string[] | null
                    horn_bleeper_cameras_photos: string[] | null
                    windscreen_photos: string[] | null
                    tyres_photos: string[] | null
                    wheels_nuts_indicators_photos: string[] | null
                    fuel_tanks_photos: string[] | null
                    external_equipment_photos: string[] | null
                    height_indicator_photos: string[] | null
                    operators_licence_photos: string[] | null
                    load_secured_photos: string[] | null
                    air_leaks_photos: string[] | null
                    advanced_systems_photos: string[] | null
                    fifth_wheel_slider_photos: string[] | null
                    trailer_docs_photos: string[] | null
                    landing_legs_photos: string[] | null
                    cables_photos: string[] | null
                    load_bed_photos: string[] | null
                    load_area_clean_photos: string[] | null
                    fridge_systems_photos: string[] | null
                    fridge_temp_settings_photos: string[] | null
                    tail_lift_photos: string[] | null
                }
                Insert: {
                    id?: string
                    vehicle_id: string
                    user_id: string
                    status?: 'draft' | 'completed' | 'failed' | 'passed'
                    created_at?: string
                    completion_time?: string | null
                    trip: 'pre-trip' | 'post-trip'
                    signature?: string | null
                    full_name?: string | null
                    // Value fields
                    time_start_value?: string | null
                    time_finish_value?: string | null
                    odo_reading_start_value?: string | null
                    odo_reading_finish_value?: string | null
                    height_value?: string | null
                    fridge_temp_start?: string | null
                    // Inspection Items (Checkbox fields)
                    headlights?: 'passed' | 'failed' | null
                    turn_signals?: 'passed' | 'failed' | null
                    mirrors?: 'passed' | 'failed' | null
                    brakes?: 'passed' | 'failed' | null
                    tachograph_serviceable?: 'passed' | 'failed' | null
                    tacho_spare_paper?: 'passed' | 'failed' | null
                    driver_cpc_card?: 'passed' | 'failed' | null
                    fluid_levels?: 'passed' | 'failed' | null
                    lights?: 'passed' | 'failed' | null
                    horn_bleeper_cameras?: 'passed' | 'failed' | null
                    windscreen?: 'passed' | 'failed' | null
                    tyres?: 'passed' | 'failed' | null
                    wheels_nuts_indicators?: 'passed' | 'failed' | null
                    fuel_tanks?: 'passed' | 'failed' | null
                    external_equipment?: 'passed' | 'failed' | null
                    height_indicator?: 'passed' | 'failed' | null
                    operators_licence?: 'passed' | 'failed' | null
                    load_secured?: 'passed' | 'failed' | null
                    air_leaks?: 'passed' | 'failed' | null
                    advanced_systems?: 'passed' | 'failed' | null
                    fifth_wheel_slider?: 'passed' | 'failed' | null
                    trailer_docs?: 'passed' | 'failed' | null
                    landing_legs?: 'passed' | 'failed' | null
                    cables?: 'passed' | 'failed' | null
                    load_bed?: 'passed' | 'failed' | null
                    load_area_clean?: 'passed' | 'failed' | null
                    fridge_systems?: 'passed' | 'failed' | null
                    fridge_temp_settings?: 'passed' | 'failed' | null
                    tail_lift?: 'passed' | 'failed' | null
                    // Notes
                    headlights_notes?: string | null
                    turn_signals_notes?: string | null
                    mirrors_notes?: string | null
                    brakes_notes?: string | null
                    tachograph_serviceable_notes?: string | null
                    tacho_spare_paper_notes?: string | null
                    driver_cpc_card_notes?: string | null
                    fluid_levels_notes?: string | null
                    lights_notes?: string | null
                    horn_bleeper_cameras_notes?: string | null
                    windscreen_notes?: string | null
                    tyres_notes?: string | null
                    wheels_nuts_indicators_notes?: string | null
                    fuel_tanks_notes?: string | null
                    external_equipment_notes?: string | null
                    height_indicator_notes?: string | null
                    operators_licence_notes?: string | null
                    load_secured_notes?: string | null
                    air_leaks_notes?: string | null
                    advanced_systems_notes?: string | null
                    fifth_wheel_slider_notes?: string | null
                    trailer_docs_notes?: string | null
                    landing_legs_notes?: string | null
                    cables_notes?: string | null
                    load_bed_notes?: string | null
                    load_area_clean_notes?: string | null
                    fridge_systems_notes?: string | null
                    fridge_temp_settings_notes?: string | null
                    tail_lift_notes?: string | null
                    // Photos
                    headlights_photos?: string[] | null
                    turn_signals_photos?: string[] | null
                    mirrors_photos?: string[] | null
                    brakes_photos?: string[] | null
                    tachograph_serviceable_photos?: string[] | null
                    tacho_spare_paper_photos?: string[] | null
                    driver_cpc_card_photos?: string[] | null
                    fluid_levels_photos?: string[] | null
                    lights_photos?: string[] | null
                    horn_bleeper_cameras_photos?: string[] | null
                    windscreen_photos?: string[] | null
                    tyres_photos?: string[] | null
                    wheels_nuts_indicators_photos?: string[] | null
                    fuel_tanks_photos?: string[] | null
                    external_equipment_photos?: string[] | null
                    height_indicator_photos?: string[] | null
                    operators_licence_photos?: string[] | null
                    load_secured_photos?: string[] | null
                    air_leaks_photos?: string[] | null
                    advanced_systems_photos?: string[] | null
                    fifth_wheel_slider_photos?: string[] | null
                    trailer_docs_photos?: string[] | null
                    landing_legs_photos?: string[] | null
                    cables_photos?: string[] | null
                    load_bed_photos?: string[] | null
                    load_area_clean_photos?: string[] | null
                    fridge_systems_photos?: string[] | null
                    fridge_temp_settings_photos?: string[] | null
                    tail_lift_photos?: string[] | null
                }
                Update: {
                    id?: string
                    vehicle_id?: string
                    user_id?: string
                    status?: 'draft' | 'completed' | 'failed' | 'passed'
                    created_at?: string
                    completion_time?: string | null
                    trip?: 'pre-trip' | 'post-trip'
                    signature?: string | null
                    full_name?: string | null
                    // Value fields
                    time_start_value?: string | null
                    time_finish_value?: string | null
                    odo_reading_start_value?: string | null
                    odo_reading_finish_value?: string | null
                    height_value?: string | null
                    fridge_temp_start?: string | null
                    // Inspection Items (Checkbox fields)
                    headlights?: 'passed' | 'failed' | null
                    turn_signals?: 'passed' | 'failed' | null
                    mirrors?: 'passed' | 'failed' | null
                    brakes?: 'passed' | 'failed' | null
                    tachograph_serviceable?: 'passed' | 'failed' | null
                    tacho_spare_paper?: 'passed' | 'failed' | null
                    driver_cpc_card?: 'passed' | 'failed' | null
                    fluid_levels?: 'passed' | 'failed' | null
                    lights?: 'passed' | 'failed' | null
                    horn_bleeper_cameras?: 'passed' | 'failed' | null
                    windscreen?: 'passed' | 'failed' | null
                    tyres?: 'passed' | 'failed' | null
                    wheels_nuts_indicators?: 'passed' | 'failed' | null
                    fuel_tanks?: 'passed' | 'failed' | null
                    external_equipment?: 'passed' | 'failed' | null
                    height_indicator?: 'passed' | 'failed' | null
                    operators_licence?: 'passed' | 'failed' | null
                    load_secured?: 'passed' | 'failed' | null
                    air_leaks?: 'passed' | 'failed' | null
                    advanced_systems?: 'passed' | 'failed' | null
                    fifth_wheel_slider?: 'passed' | 'failed' | null
                    trailer_docs?: 'passed' | 'failed' | null
                    landing_legs?: 'passed' | 'failed' | null
                    cables?: 'passed' | 'failed' | null
                    load_bed?: 'passed' | 'failed' | null
                    load_area_clean?: 'passed' | 'failed' | null
                    fridge_systems?: 'passed' | 'failed' | null
                    fridge_temp_settings?: 'passed' | 'failed' | null
                    tail_lift?: 'passed' | 'failed' | null
                    // Notes
                    headlights_notes?: string | null
                    turn_signals_notes?: string | null
                    mirrors_notes?: string | null
                    brakes_notes?: string | null
                    tachograph_serviceable_notes?: string | null
                    tacho_spare_paper_notes?: string | null
                    driver_cpc_card_notes?: string | null
                    fluid_levels_notes?: string | null
                    lights_notes?: string | null
                    horn_bleeper_cameras_notes?: string | null
                    windscreen_notes?: string | null
                    tyres_notes?: string | null
                    wheels_nuts_indicators_notes?: string | null
                    fuel_tanks_notes?: string | null
                    external_equipment_notes?: string | null
                    height_indicator_notes?: string | null
                    operators_licence_notes?: string | null
                    load_secured_notes?: string | null
                    air_leaks_notes?: string | null
                    advanced_systems_notes?: string | null
                    fifth_wheel_slider_notes?: string | null
                    trailer_docs_notes?: string | null
                    landing_legs_notes?: string | null
                    cables_notes?: string | null
                    load_bed_notes?: string | null
                    load_area_clean_notes?: string | null
                    fridge_systems_notes?: string | null
                    fridge_temp_settings_notes?: string | null
                    tail_lift_notes?: string | null
                    // Photos
                    headlights_photos?: string[] | null
                    turn_signals_photos?: string[] | null
                    mirrors_photos?: string[] | null
                    brakes_photos?: string[] | null
                    tachograph_serviceable_photos?: string[] | null
                    tacho_spare_paper_photos?: string[] | null
                    driver_cpc_card_photos?: string[] | null
                    fluid_levels_photos?: string[] | null
                    lights_photos?: string[] | null
                    horn_bleeper_cameras_photos?: string[] | null
                    windscreen_photos?: string[] | null
                    tyres_photos?: string[] | null
                    wheels_nuts_indicators_photos?: string[] | null
                    fuel_tanks_photos?: string[] | null
                    external_equipment_photos?: string[] | null
                    height_indicator_photos?: string[] | null
                    operators_licence_photos?: string[] | null
                    load_secured_photos?: string[] | null
                    air_leaks_photos?: string[] | null
                    advanced_systems_photos?: string[] | null
                    fifth_wheel_slider_photos?: string[] | null
                    trailer_docs_photos?: string[] | null
                    landing_legs_photos?: string[] | null
                    cables_photos?: string[] | null
                    load_bed_photos?: string[] | null
                    load_area_clean_photos?: string[] | null
                    fridge_systems_photos?: string[] | null
                    fridge_temp_settings_photos?: string[] | null
                    tail_lift_photos?: string[] | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
} 