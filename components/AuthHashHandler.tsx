'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// lib/supabase.ts sets 'oauth_redirect' in sessionStorage before the Supabase client
// clears the hash. We check that flag here and redirect once the session is ready.
export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('oauth_redirect')) return;
    sessionStorage.removeItem('oauth_redirect');

    // Session is already stored in localStorage by the time we get here.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return; // shouldn't happen, but bail gracefully

      // Create profile row on first Google sign-in
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!existing) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';
        await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: name,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        });
      }

      // Hard reload so the whole app boots with the fresh session
      window.location.replace('/');
    });
  }, [router]);

  return null;
}
