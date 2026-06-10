'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export default function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top row: logo + location */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-[22px] font-black text-[#F7501F] tracking-tight leading-none">theonline18</span>
        </Link>
        <div className="flex items-center gap-1 text-[#888] text-sm">
          <svg className="w-4 h-4 text-[#F7501F]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-[#222]">Monrovia, Liberia</span>
        </div>
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
