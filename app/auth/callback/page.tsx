'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle both PKCE (?code=) and implicit (#access_token=) flows
    const handleCallback = async () => {
      // Supabase client auto-processes #access_token hash fragments on init.
      // Just wait briefly for the session to be established, then redirect.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Ensure profile row exists (first Google sign-in)
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

        router.replace('/');
      } else {
        // No session yet — wait for Supabase to process the hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
          if (s) {
            subscription.unsubscribe();
            router.replace('/');
          }
        });

        // Timeout fallback
        setTimeout(() => router.replace('/auth?error=oauth'), 8000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
