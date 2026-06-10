'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import type { Listing, ListingCondition } from '@/lib/types';

const CONDITIONS: ListingCondition[] = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q')?.trim() ?? '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition | ''>('');
  const [hasMore, setHasMore] = useState(false);

  const PAGE_SIZE = 20;

  const fetchResults = useCallback(async (cursor?: string) => {
    if (!q) return;
    setLoading(true);

    let query = supabase
      .from('listings')
      .select('*, profiles(full_name, whatsapp_number, location), categories(name, icon, slug)')
      .eq('is_active', true)
      .eq('is_sold', false)
      .textSearch('search_vector', q, { type: 'websearch' })
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (condition) query = query.eq('condition', condition);
    if (cursor) query = query.lt('created_at', cursor);

    const { data } = await query;
    const items = (data ?? []) as Listing[];

    if (cursor) {
      setListings((prev) => [...prev, ...items]);
    } else {
      setListings(items);
    }
    setHasMore(items.length >= PAGE_SIZE);
    setLoading(false);
  }, [q, minPrice, maxPrice, condition]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const loadMore = () => {
    const oldest = listings[listings.length - 1]?.created_at;
    if (oldest) fetchResults(oldest);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
  };

  const hasActiveFilters = minPrice || maxPrice || condition;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Filter bar */}
      <div className="bg-white border-b border-[#F0F0F0] px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            hasActiveFilters ? 'bg-[#F7501F] text-white border-[#F7501F]' : 'bg-white text-[#444] border-[#E8E8E8]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full ml-0.5" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[#F7501F] text-sm font-semibold">
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border-b border-[#F0F0F0] px-4 py-4 space-y-4">
          {/* Price range */}
          <div>
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Price (USD)</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">$</span>
                <input
                  type="number" min="0" placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-xl pl-7 pr-3 py-2.5 text-sm text-[#222] placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
                />
              </div>
              <span className="text-[#888] text-sm">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-sm">$</span>
                <input
                  type="number" min="0" placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-xl pl-7 pr-3 py-2.5 text-sm text-[#222] placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
                />
              </div>
            </div>
          </div>

          {/* Condition */}
          <div>
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">Condition</p>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(condition === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    condition === c ? 'bg-[#F7501F] text-white border-[#F7501F]' : 'bg-white text-[#444] border-[#E8E8E8]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {q ? (
        <>
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-[#222] font-bold text-base">
              Results for <span className="text-[#F7501F]">&ldquo;{q}&rdquo;</span>
            </h2>
            <span className="text-[#888] text-sm">{listings.length}{hasMore ? '+' : ''} items</span>
          </div>

          {loading && listings.length === 0 ? (
            <div className="grid grid-cols-2 gap-2 px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#E8E8E8]" />
                  <div className="p-2.5 space-y-1.5">
                    <div className="h-3.5 bg-[#E8E8E8] rounded w-3/4" />
                    <div className="h-3 bg-[#E8E8E8] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <p className="text-[#222] font-bold text-lg mb-1">No results found</p>
              <p className="text-[#888] text-sm">Try different keywords{hasActiveFilters ? ' or clear filters' : ''}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 px-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {hasMore && (
                <div className="px-4 pt-4 pb-2">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-[#E8E8E8] bg-white text-[#444] text-sm font-bold hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>
          <p className="text-[#222] font-bold text-lg mb-1">Search for anything</p>
          <p className="text-[#888] text-sm">Type in the search bar above to find items near you</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
