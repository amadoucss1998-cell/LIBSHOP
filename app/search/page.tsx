'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ListingGrid from '@/components/ListingGrid';
import type { Listing } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);

    async function search() {
      // Firestore prefix search on lowercased title
      const term = q.toLowerCase();
      const snap = await getDocs(
        query(
          collection(db, 'listings'),
          where('is_active', '==', true),
          where('is_sold', '==', false),
          where('title_lower', '>=', term),
          where('title_lower', '<=', term + ''),
          orderBy('title_lower'),
          limit(40),
        )
      );
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Listing)));
      setLoading(false);
    }

    search();
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">
        Search results for <span className="text-[#BF1F2E]">&ldquo;{q}&rdquo;</span>
      </h1>
      <p className="text-sm text-gray-400 mb-5">
        {loading ? 'Searching...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
      </p>
      {!loading && <ListingGrid listings={listings} />}
    </div>
  );
}
