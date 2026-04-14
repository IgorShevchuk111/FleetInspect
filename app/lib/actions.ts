'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { auth, signIn, signOut } from '@/app/features/auth/utils/auth';

import { revalidatePath } from 'next/cache';

export async function signInWithEmail(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // First authenticate with Supabase
    const { data: { user }, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    // Then sign in with NextAuth
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    redirect('/');
  } catch (error) {
    throw error;
  }
}

export async function signInAction() {
  try {
    await signIn('google', {
      callbackUrl: '/',
      redirect: true,
    });
  } catch (error) {
    redirect('/login');
  }
}

export async function signOutAction() {
  try {
    // Sign out from Supabase first
    await supabase.auth.signOut();
    // Then sign out from NextAuth
    await signOut({
      redirect: true,
      redirectTo: '/login'
    });
  } catch (error) {
    redirect('/login');
  }
}

export const uploadImage = async (file) => {
  if (!file) return null;

  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1e6);
  const imageName = `${timestamp}-${randomNumber}-${file.name.replace(
    /\//g,
    ''
  )}`;

  const { data, error: uploadError } = await supabase.storage
    .from('inspections-images')
    .upload(imageName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw new Error('Failed to upload image');

  const { publicUrl } = supabase.storage
    .from('inspections-images')
    .getPublicUrl(data.path).data;

  return publicUrl;
};

export async function createUpdateInspection(formData: FormData, id?: string) {
  try {
    // Get NextAuth session
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error('You must be logged in to submit an inspection');
    }

    // Get user ID from session (this is now a UUID that matches our database)
    const userId = session.user.id || session.user.userId;
    if (!userId) {
      throw new Error('Failed to get user ID from session');
    }

    // Check if user exists, but don't create if they don't exist
    // Just use the ID from the session
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      // Don't throw error, just log it and continue
    }

    // Convert FormData to a regular object and log it
    const formDataObj = Object.fromEntries(formData.entries());

    // Define all known database columns for fleet_inspections table
    // Based on the TypeScript schema from types/supabase.ts
    const knownDbColumns = {
      // Metadata fields
      metadata: ['id', 'vehicle_id', 'user_id', 'status', 'created_at', 'completion_time', 'trip', 'signature', 'full_name'],

      // Checkbox fields (store 'passed'/'failed' values)
      checkboxFields: [
        'headlights', 'turn_signals', 'mirrors', 'brakes',
        'tachograph_serviceable', 'tacho_spare_paper', 'driver_cpc_card', 'fluid_levels',
        'lights', 'horn_bleeper_cameras', 'windscreen', 'tyres', 'wheels_nuts_indicators',
        'fuel_tanks', 'external_equipment', 'operators_licence',
        'load_secured', 'air_leaks', 'advanced_systems', 'fifth_wheel_slider',
        'trailer_docs', 'landing_legs', 'cables', 'load_bed', 'load_area_clean',
        'fridge_systems', 'fridge_temp_settings', 'tail_lift'
      ],

      // Notes fields (store text values)
      notesFields: [
        'headlights_notes', 'turn_signals_notes', 'mirrors_notes', 'brakes_notes',
        'tachograph_serviceable_notes', 'tacho_spare_paper_notes', 'driver_cpc_card_notes',
        'fluid_levels_notes', 'lights_notes', 'horn_bleeper_cameras_notes', 'windscreen_notes',
        'tyres_notes', 'wheels_nuts_indicators_notes', 'fuel_tanks_notes', 'external_equipment_notes',
        'operators_licence_notes', 'load_secured_notes', 'air_leaks_notes',
        'advanced_systems_notes', 'fifth_wheel_slider_notes', 'trailer_docs_notes', 'landing_legs_notes',
        'cables_notes', 'load_bed_notes', 'load_area_clean_notes', 'fridge_systems_notes',
        'fridge_temp_settings_notes', 'tail_lift_notes'
      ],

      // Photos fields (store string arrays)
      photosFields: [
        'headlights_photos', 'turn_signals_photos', 'mirrors_photos', 'brakes_photos',
        'tachograph_serviceable_photos', 'tacho_spare_paper_photos', 'driver_cpc_card_photos',
        'fluid_levels_photos', 'lights_photos', 'horn_bleeper_cameras_photos', 'windscreen_photos',
        'tyres_photos', 'wheels_nuts_indicators_photos', 'fuel_tanks_photos', 'external_equipment_photos',
        'operators_licence_photos', 'load_secured_photos', 'air_leaks_photos',
        'advanced_systems_photos', 'fifth_wheel_slider_photos', 'trailer_docs_photos', 'landing_legs_photos',
        'cables_photos', 'load_bed_photos', 'load_area_clean_photos', 'fridge_systems_photos',
        'fridge_temp_settings_photos', 'tail_lift_photos'
      ],

      // Value fields (store text/number values)
      valueFields: [
        'time_start_value', 'time_finish_value', 'odo_reading_start_value', 'odo_reading_finish_value',
        'height_value', 'fridge_temp_start'
      ]
    };

    // Combine all known columns
    const allKnownColumns = [
      ...knownDbColumns.metadata,
      ...knownDbColumns.checkboxFields,
      ...knownDbColumns.notesFields,
      ...knownDbColumns.photosFields,
      ...knownDbColumns.valueFields
    ];

    // Create the final data object with only the required fields
    const finalData: Record<string, any> = {
      vehicle_id: formDataObj.vehicleId, // This is now a UUID string
      user_id: userId, // This is now a UUID string
      trip: formDataObj.trip,
      status: formDataObj.status || 'passed' // Use provided status or default to passed
    };

    // Add full_name if provided
    if (formDataObj.full_name) {
      finalData.full_name = formDataObj.full_name;
    }

    // Add signature if provided
    if (formDataObj.signature) {
      finalData.signature = formDataObj.signature;
    }

    // Process checkbox fields dynamically
    let hasFailedItems = false;

    knownDbColumns.checkboxFields.forEach(field => {
      const value = formDataObj[field];
      if (value === 'passed' || value === 'failed') {
        finalData[field] = value;
        if (value === 'failed') {
          hasFailedItems = true;
        }
      } else if (value) {
        // If the field has some other value, default to failed
        finalData[field] = 'failed';
        hasFailedItems = true;
      }
    });

    // Process notes fields dynamically - check both direct notes and _notes pattern
    knownDbColumns.notesFields.forEach(notesField => {
      const value = formDataObj[notesField];
      if (value) {
        finalData[notesField] = value;
      }
    });

    // Also check for notes using the pattern: {field}_notes
    knownDbColumns.checkboxFields.forEach(field => {
      const notesKey = `${field}_notes`;
      const notesValue = formDataObj[notesKey];
      if (notesValue && knownDbColumns.notesFields.includes(notesKey)) {
        finalData[notesKey] = notesValue;
      }
    });

    // Process value fields (time, odometer, etc.)
    knownDbColumns.valueFields.forEach(field => {
      const value = formDataObj[field];
      if (value) {
        finalData[field] = value;
      }
    });

    // Handle photos for checkbox fields
    for (const field of knownDbColumns.checkboxFields) {
      const photoKey = `${field}_photos`;
      const photoUrlsKey = `${field}_photos_urls`;

      // Only process if this photo field exists in the database
      if (knownDbColumns.photosFields.includes(photoKey)) {
        // Handle new photo uploads
        const photos = formData.getAll(photoKey);
        const existingPhotos = formData.getAll(photoUrlsKey);

        if (photos.length > 0 || existingPhotos.length > 0) {
          // Handle new photo uploads
          const uploadPromises = photos.map(photo => uploadImage(photo));
          const uploadedUrls = await Promise.all(uploadPromises);

          // Combine existing and new photo URLs
          finalData[photoKey] = [...existingPhotos, ...uploadedUrls].filter(Boolean);
        }
      }
    }

    // Update the final status based on inspection items
    finalData.status = hasFailedItems ? 'failed' : 'passed';



    let result;
    try {
      if (id) {
        const { data, error } = await (supabase as any)
          .from('fleet_inspections')
          .update(finalData)
          .eq('id', id)
          .select();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await (supabase as any)
          .from('fleet_inspections')
          .insert([finalData])
          .select();

        if (error) throw error;
        result = data;
      }

      // Revalidate both paths to ensure proper cache invalidation
      revalidatePath('/inspections');
      if (id) {
        revalidatePath(`/inspections/${id}`);
      }

      // Return the result instead of redirecting
      return { success: true, data: result };
    } catch (error: any) {
      throw new Error(`Database operation failed: ${error.message}`);
    }
  } catch (error: any) {
    throw error;
  }
}

