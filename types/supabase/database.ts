export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      driver_journal_shifts: {
        Row: {
          break: number
          created_at: string
          date: string
          driving: number
          earn: number
          end: string | null
          end_date: string | null
          id: string
          rest: number
          rest_type: 'daily' | 'weekly'
          start: string
          user_id: string
        }

        Insert: {
          break?: number
          created_at?: string
          date: string
          driving?: number
          earn?: number
          end?: string | null
          end_date?: string | null
          id?: string
          rest?: number
          rest_type?: 'daily' | 'weekly'
          start: string
          user_id: string
        }

        Update: {
          break?: number
          created_at?: string
          date?: string
          driving?: number
          earn?: number
          end?: string | null
          end_date?: string | null
          id?: string
          rest?: number
          rest_type?: 'daily' | 'weekly'
          start?: string
          user_id?: string
        }

        Relationships: []
      }
      fleet_inspections: {
        Row: {
          advanced_systems: string | null
          advanced_systems_notes: string | null
          advanced_systems_photos: string[] | null
          air_leaks: string | null
          air_leaks_notes: string | null
          air_leaks_photos: string[] | null
          brakes: string | null
          brakes_notes: string | null
          brakes_photos: string[] | null
          cables: string | null
          cables_notes: string | null
          cables_photos: string[] | null
          completion_time: string | null
          created_at: string | null
          driver_cpc_card: string | null
          driver_cpc_card_notes: string | null
          driver_cpc_card_photos: string[] | null
          external_equipment: string | null
          external_equipment_notes: string | null
          external_equipment_photos: string[] | null
          fifth_wheel_slider: string | null
          fifth_wheel_slider_notes: string | null
          fifth_wheel_slider_photos: string[] | null
          fluid_levels: string | null
          fluid_levels_notes: string | null
          fluid_levels_photos: string[] | null
          fridge_systems: string | null
          fridge_systems_notes: string | null
          fridge_systems_photos: string[] | null
          fridge_temp_settings: string | null
          fridge_temp_settings_notes: string | null
          fridge_temp_settings_photos: string[] | null
          fridge_temp_start: string | null
          fuel_tanks: string | null
          fuel_tanks_notes: string | null
          fuel_tanks_photos: string[] | null
          full_name: string | null
          height_indicator_notes: string | null
          height_indicator_photos: string[] | null
          height_value: string | null
          horn_bleeper_cameras: string | null
          horn_bleeper_cameras_notes: string | null
          horn_bleeper_cameras_photos: string[] | null
          id: string
          landing_legs: string | null
          landing_legs_notes: string | null
          landing_legs_photos: string[] | null
          lights: string | null
          lights_notes: string | null
          lights_photos: string[] | null
          load_area_clean: string | null
          load_area_clean_notes: string | null
          load_area_clean_photos: string[] | null
          load_bed: string | null
          load_bed_notes: string | null
          load_bed_photos: string[] | null
          load_secured: string | null
          load_secured_notes: string | null
          load_secured_photos: string[] | null
          mirrors: string | null
          mirrors_notes: string | null
          mirrors_photos: string[] | null
          odo_reading_finish_value: string | null
          odo_reading_start_value: string | null
          operators_licence: string | null
          operators_licence_notes: string | null
          operators_licence_photos: string[] | null
          signature: string | null
          status: string
          tacho_spare_paper: string | null
          tacho_spare_paper_notes: string | null
          tacho_spare_paper_photos: string[] | null
          tachograph_serviceable: string | null
          tachograph_serviceable_notes: string | null
          tachograph_serviceable_photos: string[] | null
          tail_lift: string | null
          tail_lift_notes: string | null
          tail_lift_photos: string[] | null
          time_finish_value: string | null
          time_start_value: string | null
          trailer_docs: string | null
          trailer_docs_notes: string | null
          trailer_docs_photos: string[] | null
          trip: string
          tyres: string | null
          tyres_notes: string | null
          tyres_photos: string[] | null
          user_id: string
          vehicle_id: string
          wheels_nuts_indicators: string | null
          wheels_nuts_indicators_notes: string | null
          wheels_nuts_indicators_photos: string[] | null
          windscreen: string | null
          windscreen_notes: string | null
          windscreen_photos: string[] | null
        }
        Insert: {
          advanced_systems?: string | null
          advanced_systems_notes?: string | null
          advanced_systems_photos?: string[] | null
          air_leaks?: string | null
          air_leaks_notes?: string | null
          air_leaks_photos?: string[] | null
          brakes?: string | null
          brakes_notes?: string | null
          brakes_photos?: string[] | null
          cables?: string | null
          cables_notes?: string | null
          cables_photos?: string[] | null
          completion_time?: string | null
          created_at?: string | null
          driver_cpc_card?: string | null
          driver_cpc_card_notes?: string | null
          driver_cpc_card_photos?: string[] | null
          external_equipment?: string | null
          external_equipment_notes?: string | null
          external_equipment_photos?: string[] | null
          fifth_wheel_slider?: string | null
          fifth_wheel_slider_notes?: string | null
          fifth_wheel_slider_photos?: string[] | null
          fluid_levels?: string | null
          fluid_levels_notes?: string | null
          fluid_levels_photos?: string[] | null
          fridge_systems?: string | null
          fridge_systems_notes?: string | null
          fridge_systems_photos?: string[] | null
          fridge_temp_settings?: string | null
          fridge_temp_settings_notes?: string | null
          fridge_temp_settings_photos?: string[] | null
          fridge_temp_start?: string | null
          fuel_tanks?: string | null
          fuel_tanks_notes?: string | null
          fuel_tanks_photos?: string[] | null
          full_name?: string | null
          height_indicator_notes?: string | null
          height_indicator_photos?: string[] | null
          height_value?: string | null
          horn_bleeper_cameras?: string | null
          horn_bleeper_cameras_notes?: string | null
          horn_bleeper_cameras_photos?: string[] | null
          id?: string
          landing_legs?: string | null
          landing_legs_notes?: string | null
          landing_legs_photos?: string[] | null
          lights?: string | null
          lights_notes?: string | null
          lights_photos?: string[] | null
          load_area_clean?: string | null
          load_area_clean_notes?: string | null
          load_area_clean_photos?: string[] | null
          load_bed?: string | null
          load_bed_notes?: string | null
          load_bed_photos?: string[] | null
          load_secured?: string | null
          load_secured_notes?: string | null
          load_secured_photos?: string[] | null
          mirrors?: string | null
          mirrors_notes?: string | null
          mirrors_photos?: string[] | null
          odo_reading_finish_value?: string | null
          odo_reading_start_value?: string | null
          operators_licence?: string | null
          operators_licence_notes?: string | null
          operators_licence_photos?: string[] | null
          signature?: string | null
          status: string
          tacho_spare_paper?: string | null
          tacho_spare_paper_notes?: string | null
          tacho_spare_paper_photos?: string[] | null
          tachograph_serviceable?: string | null
          tachograph_serviceable_notes?: string | null
          tachograph_serviceable_photos?: string[] | null
          tail_lift?: string | null
          tail_lift_notes?: string | null
          tail_lift_photos?: string[] | null
          time_finish_value?: string | null
          time_start_value?: string | null
          trailer_docs?: string | null
          trailer_docs_notes?: string | null
          trailer_docs_photos?: string[] | null
          trip: string
          tyres?: string | null
          tyres_notes?: string | null
          tyres_photos?: string[] | null
          user_id: string
          vehicle_id: string
          wheels_nuts_indicators?: string | null
          wheels_nuts_indicators_notes?: string | null
          wheels_nuts_indicators_photos?: string[] | null
          windscreen?: string | null
          windscreen_notes?: string | null
          windscreen_photos?: string[] | null
        }
        Update: {
          advanced_systems?: string | null
          advanced_systems_notes?: string | null
          advanced_systems_photos?: string[] | null
          air_leaks?: string | null
          air_leaks_notes?: string | null
          air_leaks_photos?: string[] | null
          brakes?: string | null
          brakes_notes?: string | null
          brakes_photos?: string[] | null
          cables?: string | null
          cables_notes?: string | null
          cables_photos?: string[] | null
          completion_time?: string | null
          created_at?: string | null
          driver_cpc_card?: string | null
          driver_cpc_card_notes?: string | null
          driver_cpc_card_photos?: string[] | null
          external_equipment?: string | null
          external_equipment_notes?: string | null
          external_equipment_photos?: string[] | null
          fifth_wheel_slider?: string | null
          fifth_wheel_slider_notes?: string | null
          fifth_wheel_slider_photos?: string[] | null
          fluid_levels?: string | null
          fluid_levels_notes?: string | null
          fluid_levels_photos?: string[] | null
          fridge_systems?: string | null
          fridge_systems_notes?: string | null
          fridge_systems_photos?: string[] | null
          fridge_temp_settings?: string | null
          fridge_temp_settings_notes?: string | null
          fridge_temp_settings_photos?: string[] | null
          fridge_temp_start?: string | null
          fuel_tanks?: string | null
          fuel_tanks_notes?: string | null
          fuel_tanks_photos?: string[] | null
          full_name?: string | null
          height_indicator_notes?: string | null
          height_indicator_photos?: string[] | null
          height_value?: string | null
          horn_bleeper_cameras?: string | null
          horn_bleeper_cameras_notes?: string | null
          horn_bleeper_cameras_photos?: string[] | null
          id?: string
          landing_legs?: string | null
          landing_legs_notes?: string | null
          landing_legs_photos?: string[] | null
          lights?: string | null
          lights_notes?: string | null
          lights_photos?: string[] | null
          load_area_clean?: string | null
          load_area_clean_notes?: string | null
          load_area_clean_photos?: string[] | null
          load_bed?: string | null
          load_bed_notes?: string | null
          load_bed_photos?: string[] | null
          load_secured?: string | null
          load_secured_notes?: string | null
          load_secured_photos?: string[] | null
          mirrors?: string | null
          mirrors_notes?: string | null
          mirrors_photos?: string[] | null
          odo_reading_finish_value?: string | null
          odo_reading_start_value?: string | null
          operators_licence?: string | null
          operators_licence_notes?: string | null
          operators_licence_photos?: string[] | null
          signature?: string | null
          status?: string
          tacho_spare_paper?: string | null
          tacho_spare_paper_notes?: string | null
          tacho_spare_paper_photos?: string[] | null
          tachograph_serviceable?: string | null
          tachograph_serviceable_notes?: string | null
          tachograph_serviceable_photos?: string[] | null
          tail_lift?: string | null
          tail_lift_notes?: string | null
          tail_lift_photos?: string[] | null
          time_finish_value?: string | null
          time_start_value?: string | null
          trailer_docs?: string | null
          trailer_docs_notes?: string | null
          trailer_docs_photos?: string[] | null
          trip?: string
          tyres?: string | null
          tyres_notes?: string | null
          tyres_photos?: string[] | null
          user_id?: string
          vehicle_id?: string
          wheels_nuts_indicators?: string | null
          wheels_nuts_indicators_notes?: string | null
          wheels_nuts_indicators_photos?: string[] | null
          windscreen?: string | null
          windscreen_notes?: string | null
          windscreen_photos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      form: {
        Row: {
          created_at: string
          hidden: boolean
          id: string
          is_disabled: boolean | null
          is_required: boolean | null
          label: string
          name: string
          placeholder: string | null
          position: number
          trip: string | null
          type: string
          vehicletype: string | null
        }
        Insert: {
          created_at?: string
          hidden?: boolean
          id?: string
          is_disabled?: boolean | null
          is_required?: boolean | null
          label: string
          name: string
          placeholder?: string | null
          position: number
          trip?: string | null
          type?: string
          vehicletype?: string | null
        }
        Update: {
          created_at?: string
          hidden?: boolean
          id?: string
          is_disabled?: boolean | null
          is_required?: boolean | null
          label?: string
          name?: string
          placeholder?: string | null
          position?: number
          trip?: string | null
          type?: string
          vehicletype?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          regnumber: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          regnumber: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          regnumber?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_user: {
        Args: {
          user_email: string
          user_full_name?: string
          user_id: string
          user_role?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
