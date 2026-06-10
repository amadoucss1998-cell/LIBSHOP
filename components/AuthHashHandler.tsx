'use client';
import { useEffect } from 'react';

// When Supabase OAuth redirects to the root with #access_token=..., forward to the
// dedicated callback page so it can process the session and redirect cleanly.
export default function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.includes('access_token')) return;

    // Hard-navigate to /auth/callback carrying the hash so Supabase can pick it up
    window.location.replace('/auth/callback' + hash);
  }, []);

  return null;
}

