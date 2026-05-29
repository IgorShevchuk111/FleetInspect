import { createClient } from "@/lib/supabase/server";

export const uploadImage = async (file) => {
    if (!file) return null;

    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1e6);
    const imageName = `${timestamp}-${randomNumber}-${file.name.replace(
        /\//g,
        ''
    )}`;
    const supabase = await createClient();
    const { data, error: uploadError } = await supabase.storage
        .from('inspections-images')
        .upload(imageName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw new Error('Failed to upload image');

    const { publicUrl } = supabase.storage
        .from('inspections-images')
        .getPublicUrl(data.path).data;

    return publicUrl;
};