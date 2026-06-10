'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }

    let userId: string;

    const loadUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (!convs?.length) { setUnreadCount(0); return; }

      const convIds = convs.map((c: { id: string }) => c.id);
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('is_read', false)
        .neq('sender_id', userId);

      setUnreadCount(count ?? 0);
    };

    loadUnread();

    const channel = supabase
      .channel('unread_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, loadUnread)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, loadUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn, pathname]);

  const active = (path: string) => pathname === path;

  const handleAuthRequired = (e: React.MouseEvent, href: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E8]">
      <div className="flex items-end max-w-lg mx-auto px-2 pt-2 pb-3">

        {/* LEFT GROUP */}
        <div className="flex flex-1 items-end justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 min-w-[48px]">
            <svg className={`w-6 h-6 ${active('/') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-[10px] font-semibold ${active('/') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Home</span>
          </Link>

          <Link href="/search" className="flex flex-col items-center gap-1 min-w-[48px]">
            <svg className={`w-6 h-6 ${active('/search') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className={`text-[10px] font-semibold ${active('/search') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Search</span>
          </Link>
        </div>

        {/* CENTER — SELL */}
        <div className="flex flex-col items-center flex-shrink-0 px-2">
          <Link href="/listings/new" className="flex flex-col items-center gap-1 -mt-4" onClick={(e) => handleAuthRequired(e, '/listings/new')}>
            <div className="w-14 h-14 rounded-full bg-[#F7501F] flex items-center justify-center shadow-lg shadow-[#F7501F]/40">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#F7501F]">SELL</span>
          </Link>
        </div>

        {/* RIGHT GROUP */}
        <div className="flex flex-1 items-end justify-around">
          {isLoggedIn ? (
            <Link href="/chats" className="flex flex-col items-center gap-1 min-w-[48px]">
              <div className="relative">
                <svg className={`w-6 h-6 ${active('/chats') || pathname.startsWith('/chats/') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/chats') || pathname.startsWith('/chats/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F7501F] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${active('/chats') || pathname.startsWith('/chats/') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Chats</span>
            </Link>
          ) : (
            <Link href="/auth" className="flex flex-col items-center gap-1 min-w-[48px]">
              <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-[10px] font-semibold text-[#888]">Sign in</span>
            </Link>
          )}

          {isLoggedIn ? (
            <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[48px]">
              <svg className={`w-6 h-6 ${active('/profile') ? 'text-[#F7501F]' : 'text-[#888]'}`} fill={active('/profile') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-[10px] font-semibold ${active('/profile') ? 'text-[#F7501F]' : 'text-[#888]'}`}>Profile</span>
            </Link>
          ) : (
            <div className="min-w-[48px]" />
          )}
        </div>

      </div>
    </nav>
  );
}
