import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Image upload ────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image type. Use JPG, PNG, WebP, or GIF.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 5 MB.`;
  }
  return null;
}

export async function uploadListingImage(file: File, listingId: string): Promise<string | null> {
  const validationError = validateImageFile(file);
  if (validationError) {
    console.error('Image validation failed:', validationError);
    return null;
  }

  // Use the MIME type for the extension to avoid spoofing via filename
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `${listingId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Upload all images for a listing; returns array of successfully uploaded URLs
export async function uploadListingImages(files: File[], listingId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadListingImage(file, listingId);
    if (url) urls.push(url);
  }
  return urls;
}

// ─── Saved listings ──────────────────────────────────────────────────────────

export async function toggleSaveListing(listingId: string): Promise<boolean | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // not logged in

  const { data: existing } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    await supabase.from('saved_listings').delete().eq('id', existing.id);
    return false; // now unsaved
  } else {
    await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId });
    return true; // now saved
  }
}

export async function getSavedListingIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId);
  return (data ?? []).map((r) => r.listing_id);
}

// ─── View tracking (dedup by user or IP fingerprint) ─────────────────────────

export async function recordView(listingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Logged-in: deduplicated by unique(listing_id, viewer_id) constraint
    await supabase.from('listing_views').upsert(
      { listing_id: listingId, viewer_id: user.id },
      { ignoreDuplicates: true }
    );
  }
  // Anonymous views are tracked via cookie in the page component (no DB write)
}
