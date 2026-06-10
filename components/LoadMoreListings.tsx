'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ListingCard from './ListingCard';
import type { Listing } from '@/lib/types';

const PAGE_SIZE = 20;

interface Props {
  initialListings: Listing[];
  categoryId?: number | null;
}

export default function LoadMoreListings({ initialListings, categoryId }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialListings.length >= PAGE_SIZE);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load the current user's saved listing IDs on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const { data: saved } = await supabase
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', user.id);
      if (saved) setSavedIds(new Set(saved.map((s: { listing_id: string }) => s.listing_id)));
    });
  }, []);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const oldest = listings[listings.length - 1]?.created_at;
    let query = supabase
      .from('listings')
      .select('*, profiles(full_name, whatsapp_number, location), categories(name, icon, slug)')
      .eq('is_active', true)
      .eq('is_sold', false)
      .lt('created_at', oldest)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data } = await query;
    const newItems = data ?? [];
    setListings((prev) => [...prev, ...newItems]);
    setHasMore(newItems.length >= PAGE_SIZE);
    setLoading(false);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 px-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            initialSaved={savedIds.has(listing.id)}
          />
        ))}
      </div>

      {(hasMore || loading) && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-[#E8E8E8] bg-white text-[#444] text-sm font-bold hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading...
              </span>
            ) : 'Load more'}
          </button>
        </div>
      )}

      {!hasMore && listings.length > 0 && (
        <p className="text-center text-[#bbb] text-xs py-6">You&apos;ve seen all {listings.length} items</p>
      )}
    </>
  );
}
