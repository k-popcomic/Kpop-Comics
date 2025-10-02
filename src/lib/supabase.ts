import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImage = async (file: File, customerId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${customerId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('comic-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('comic-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};