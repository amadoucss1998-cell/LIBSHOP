'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import ListingGrid from '@/components/ListingGrid';
import CategoryBar from '@/components/CategoryBar';
import Link from 'next/link';
import type { Listing } from '@/lib/types';

export default function HomePage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') ?? undefined;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const constraints: any[] = [
        where('is_active', '==', true),
        where('is_sold', '==', false),
        orderBy('created_at', 'desc'),
        limit(40),
      ];
      if (categorySlug) {
        constraints.unshift(where('category_slug', '==', categorySlug));
      }

      const q = query(collection(db, 'listings'), ...constraints);
      const snap = await getDocs(q);
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Listing)));
      setLoading(false);
    }
    fetchListings();
  }, [categorySlug]);

  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#BF1F2E] to-[#0B3D91] rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Buy & Sell in Liberia 🇱🇷</h1>
        <p className="text-white/80 text-sm mb-4">Find deals near you. Post your ad free today.</p>
        <Link href="/listings/new" className="bg-white text-[#BF1F2E] font-bold px-5 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors inline-block">
          Post Free Ad →
        </Link>
      </div>

      <CategoryBar categories={CATEGORIES} activeSlug={categorySlug} />

      <h2 className="text-lg font-bold text-gray-800 mb-3 mt-4">
        {activeCategory ? `${activeCategory.name} Listings` : 'Recent Listings'}
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </div>
  );
}
