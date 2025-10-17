import { createClient } from '@supabase/supabase-js';

// ✅ Get environment variables safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ Create Supabase client with global headers for reliability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-client-info': 'kpopcomics-client',
      'Accept': 'application/json',
    },
  },
});

/**
 * Upload an image to the Supabase Storage bucket `comic-images`.
 * Automatically retries up to 3 times if the upload fails due to timeouts.
 *
 * @param file The file object to upload
 * @param customerId Unique customer folder name
 * @returns Public URL of the uploaded image
 */
export const uploadImage = async (file: File, customerId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${customerId}/${Date.now()}.${fileExt}`;
  const bucket = supabase.storage.from('comic-images');

  // Retry logic (handles network issues or Supabase timeouts)
  const tryUpload = async (attempt = 1): Promise<string> => {
    const { data, error } = await bucket.upload(fileName, file);

    if (error) {
      console.warn(`Upload attempt ${attempt} failed:`, error.message);

      // Retry up to 3 times on timeout or connection issues
      if (attempt < 3 && error.message.toLowerCase().includes('timeout')) {
        await new Promise((r) => setTimeout(r, 2000)); // Wait 2s before retry
        return tryUpload(attempt + 1);
      }

      throw error;
    }

    // Get a public URL for the uploaded file
    const { data: urlData } = bucket.getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  return await tryUpload();
};
