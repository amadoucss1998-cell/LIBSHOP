'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // Give Supabase a tick to process the hash fragment if present
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Ensure profile row exists for first Google sign-in
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

        // Hard redirect so the whole app re-initialises with the new session
        window.location.replace('/');
      } else {
        // Still no session — wait for auth state change (handles slow networks)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
          if (s) {
            subscription.unsubscribe();
            window.location.replace('/');
          }
        });

        // Timeout fallback after 10 s
        setTimeout(() => {
          subscription.unsubscribe();
          window.location.replace('/auth?error=oauth');
        }, 10000);
      }
    };

    run();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
