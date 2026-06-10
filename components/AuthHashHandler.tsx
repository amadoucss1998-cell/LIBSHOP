'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

async function ensureProfile(userId: string, userMeta: Record<string, string>) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (!data) {
    await supabase.from('profiles').insert({
      id: userId,
      full_name: userMeta.full_name || userMeta.name || 'User',
      avatar_url: userMeta.avatar_url ?? null,
    });
  }
}

export default function AuthHashHandler() {
  useEffect(() => {
    if (!sessionStorage.getItem('supabase_oauth')) return;
    sessionStorage.removeItem('supabase_oauth');

    const handle = async () => {
      // Try immediately (session likely already in localStorage)
      let { data: { session } } = await supabase.auth.getSession();

      // If not ready yet, wait for the auth state change
      if (!session) {
        await new Promise<void>((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (s) { subscription.unsubscribe(); session = s; resolve(); }
          });
          // Timeout after 8s
          setTimeout(() => { subscription.unsubscribe(); resolve(); }, 8000);
        });
      }

      if (!session) { window.location.href = '/auth?error=oauth'; return; }

      await ensureProfile(session.user.id, session.user.user_metadata);
      // Navigate to home — use href so the full app re-boots with the session
      window.location.href = '/';
    };

    handle();
  }, []);

  return null;
}
