'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Props {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export default function StartChatButton({ listingId, sellerId, listingTitle }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Don't render while loading auth or if user is the seller
  if (userId === undefined) return null;
  if (userId === sellerId) return null;

  async function handleClick() {
    if (!userId) {
      router.push('/auth');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .upsert(
        { listing_id: listingId, buyer_id: userId, seller_id: sellerId },
        { onConflict: 'listing_id,buyer_id' }
      )
      .select('id')
      .single();

    if (data?.id && !error) {
      router.push(`/chats/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#E8E8E8] text-[#222] font-bold py-3.5 rounded-xl text-sm disabled:opacity-60"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-[#222] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
      Message seller
    </button>
  );
}
