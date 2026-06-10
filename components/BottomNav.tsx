'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E8]">
      <div className="flex items-end justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">

        {/* Home */}
        <Link href="/" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className={`w-6 h-6 ${pathname === '/' ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`text-[10px] font-semibold ${pathname === '/' ? 'text-[#F7501F]' : 'text-[#888]'}`}>Home</span>
        </Link>

        {/* Search */}
        <Link href="/search" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className={`w-6 h-6 ${pathname === '/search' ? 'text-[#F7501F]' : 'text-[#888]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className={`text-[10px] font-semibold ${pathname === '/search' ? 'text-[#F7501F]' : 'text-[#888]'}`}>Search</span>
        </Link>

        {/* SELL — center hero button */}
        <Link href="/listings/new" className="flex flex-col items-center gap-1 -mt-4">
          <div className="w-14 h-14 rounded-full bg-[#F7501F] flex items-center justify-center shadow-lg shadow-[#F7501F]/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-[#F7501F]">SELL</span>
        </Link>

        {/* Chats (placeholder) */}
        <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-[10px] font-semibold text-[#888]">Chats</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[48px]">
          <svg className={`w-6 h-6 ${pathname === '/profile' ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={pathname === '/profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={`text-[10px] font-semibold ${pathname === '/profile' ? 'text-[#F7501F]' : 'text-[#888]'}`}>Profile</span>
        </Link>

      </div>
    </nav>
  );
}
