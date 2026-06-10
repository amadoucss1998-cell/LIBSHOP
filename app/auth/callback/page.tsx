'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // PKCE flow: Supabase sends ?code= to this URL
    // The Supabase client auto-exchanges the code on init; just wait and redirect.
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/';
      } else {
        window.location.href = '/auth?error=oauth';
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <Suspense><CallbackHandler /></Suspense>;
}
