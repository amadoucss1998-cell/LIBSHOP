'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth');
        return;
      }
      setUserId(data.user.id);
      fetchConversations(data.user.id);
    });
  }, [router]);

  async function fetchConversations(uid: string) {
    const { data } = await supabase
      .from('conversations')
      .select(`*, listings(id, title, images, price, is_sold), buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url)`)
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order('last_message_at', { ascending: false });

    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF0EB] flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#F7501F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-[#222] font-bold text-lg mb-1">No chats yet</h2>
        <p className="text-[#888] text-sm mb-6">Start a conversation by messaging a seller on any listing.</p>
        <Link href="/" className="bg-[#F7501F] text-white font-bold px-6 py-3 rounded-xl text-sm">
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-[#F5F5F5] min-h-screen">
      <div className="sticky top-[104px] z-10 bg-white border-b border-[#F0F0F0] px-4 py-3">
        <h1 className="text-[#222] font-black text-lg">Chats</h1>
      </div>
      <div className="divide-y divide-[#F0F0F0] bg-white">
        {conversations.map((conv) => {
          const isBuyer = conv.buyer_id === userId;
          const otherParty = isBuyer ? conv.seller : conv.buyer;
          const listing = conv.listings;
          const thumb = listing?.images?.[0];
          const isUnread = conv.last_message && !isBuyer
            ? false // simplified: we can't easily check is_read here without joining messages
            : false;

          return (
            <Link key={conv.id} href={`/chats/${conv.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-[#F5F5F5]">
              {/* Listing thumbnail */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                {thumb ? (
                  <Image src={thumb} alt={listing?.title ?? ''} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[#222] font-bold text-sm truncate">{otherParty?.full_name ?? 'Unknown'}</p>
                  <span className="text-[#888] text-xs flex-shrink-0">{timeAgo(conv.last_message_at)}</span>
                </div>
                <p className="text-[#444] text-xs truncate mt-0.5">{listing?.title}</p>
                <p className="text-[#888] text-xs truncate mt-0.5">
                  {conv.last_message ?? 'No messages yet'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
