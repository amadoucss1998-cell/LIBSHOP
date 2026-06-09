'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🇱🇷</span>
          <span className="font-bold text-xl text-[#BF1F2E]">LibMarket</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Search listings..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) router.push(`/search?q=${encodeURIComponent(val)}`);
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/listings/new" className="btn-primary text-sm hidden sm:block">
                + Post Ad
              </Link>
              <Link href="/profile" className="text-sm text-gray-700 hover:text-[#BF1F2E] font-medium">
                My Ads
              </Link>
              <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/listings/new" className="btn-primary text-sm">
                + Post Ad
              </Link>
              <Link href="/auth" className="text-sm font-medium text-[#0B3D91]">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <input
          type="text"
          placeholder="Search listings..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) router.push(`/search?q=${encodeURIComponent(val)}`);
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF1F2E]"
        />
      </div>
    </nav>
  );
}
