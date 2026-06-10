'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Handles Supabase implicit-flow OAuth tokens delivered as hash fragments to the root URL.
export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.hash.includes('access_token')) return;

    // Supabase client auto-parses the hash; wait for the session to settle then clean up.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe();
        // Remove the hash from the URL and stay on home
        window.history.replaceState(null, '', '/');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
