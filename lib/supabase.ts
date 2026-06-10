import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local (local) or Vercel dashboard (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadListingImage(file: File, listingId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${listingId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path);

  return publicUrl;
}
