'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const active = (path: string) => pathname === path;

  const handleAuthRequired = (e: React.MouseEvent, href: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E8]">
      <div className="flex items-end justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">

        {/* Home */}
        <Link href="/" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className={`w-6 h-6 ${active('/') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`text-[10px] font-semibold ${active('/') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Home</span>
        </Link>

        {/* Search */}
        <Link href="/search" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className={`w-6 h-6 ${active('/search') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className={`text-[10px] font-semibold ${active('/search') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Search</span>
        </Link>

        {/* SELL — center hero button */}
        <Link href="/listings/new" className="flex flex-col items-center gap-1 -mt-4" onClick={(e) => handleAuthRequired(e, '/listings/new')}>
          <div className="w-14 h-14 rounded-full bg-[#F7501F] flex items-center justify-center shadow-lg shadow-[#F7501F]/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-[#F7501F]">SELL</span>
        </Link>

        {/* Saved — only when logged in */}
        {isLoggedIn ? (
          <Link href="/saved" className="flex flex-col items-center gap-1 min-w-[48px]">
            <svg className={`w-6 h-6 ${active('/saved') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/saved') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={`text-[10px] font-semibold ${active('/saved') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Saved</span>
          </Link>
        ) : (
          <Link href="/auth" className="flex flex-col items-center gap-1 min-w-[48px]">
            <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-semibold text-[#888]">Sign in</span>
          </Link>
        )}

        {/* Profile — only when logged in */}
        {isLoggedIn ? (
          <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[48px]">
            <svg className={`w-6 h-6 ${active('/profile') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/profile') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`text-[10px] font-semibold ${active('/profile') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Profile</span>
          </Link>
        ) : null}

      </div>
    </nav>
  );
}
