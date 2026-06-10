'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Handles Supabase implicit-flow OAuth tokens delivered as hash fragments to the root URL.
// Supabase processes the hash synchronously on init (before React mounts), so we poll
// getSession() rather than listening for the auth state change event.
export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.hash.includes('access_token')) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(interval);
        window.history.replaceState(null, '', '/');
        router.replace('/');
      } else if (attempts >= 10) {
        clearInterval(interval);
        router.replace('/auth?error=oauth');
      }
    }, 300);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
