'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import type { Listing } from '@/lib/types';

export default function SavedPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return; }

      const { data: saved } = await supabase
        .from('saved_listings')
        .select('listing_id, listings(*, categories(name, icon, slug))')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });

      const items = (saved ?? [])
        .map((s: any) => s.listings)
        .filter(Boolean) as Listing[];

      setListings(items);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-[#222] font-bold text-lg">Saved items</h1>
        <span className="text-[#888] text-sm">{listings.length} items</span>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-[#222] font-bold text-lg mb-1">No saved items yet</p>
          <p className="text-[#888] text-sm mb-6">Tap the heart on any listing to save it here</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#F7501F] text-white font-bold px-8 py-3 rounded-xl text-sm"
          >
            Browse listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} initialSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
