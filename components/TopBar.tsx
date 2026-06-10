'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.full_name ?? user.email ?? null);
      } else {
        setUserName(null);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
          .then(({ data }) => setUserName(data?.full_name ?? session.user.email ?? null));
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const initial = userName?.charAt(0)?.toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top row: logo + auth indicator */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-[22px] font-black text-[#F7501F] tracking-tight leading-none">theonline18</span>
        </Link>

        {userName ? (
          /* Logged in — avatar + name chip linking to profile */
          <Link href="/profile" className="flex items-center gap-2 bg-[#F5F5F5] rounded-full pl-1 pr-3 py-1">
            <div className="w-7 h-7 rounded-full bg-[#F7501F] flex items-center justify-center text-white text-xs font-black">
              {initial}
            </div>
            <span className="text-[#222] text-xs font-semibold max-w-[90px] truncate">{userName}</span>
          </Link>
        ) : (
          /* Logged out — sign in button */
          <Link
            href="/auth"
            className="flex items-center gap-1.5 bg-[#F7501F] text-white text-xs font-bold px-4 py-2 rounded-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign in
          </Link>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-4 pb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="w-full bg-[#F5F5F5] rounded-full pl-9 pr-4 py-2.5 text-sm text-[#222] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
          />
        </div>
      </form>
    </header>
  );
}
