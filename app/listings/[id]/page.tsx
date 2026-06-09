'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCategoryBySlug } from '@/lib/categories';
import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/lib/types';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      const snap = await getDoc(doc(db, 'listings', id));
      if (!snap.exists()) { setNotFoundState(true); setLoading(false); return; }

      const data = { id: snap.id, ...snap.data() } as Listing;
      setListing(data);
      setLoading(false);

      // Increment view count
      await updateDoc(doc(db, 'listings', id), { view_count: increment(1) });
    }
    fetchListing();
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="aspect-video rounded-xl bg-gray-200" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/4" />
    </div>
  );

  if (notFoundState || !listing) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-medium">Listing not found</p>
      <Link href="/" className="text-[#BF1F2E] text-sm mt-2 inline-block">← Back to listings</Link>
    </div>
  );

  const category = getCategoryBySlug(listing.category_slug);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(listing.price);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-[#BF1F2E] flex items-center gap-1 mb-4">
        ← Back to listings
      </Link>

      {/* Image Gallery */}
      {listing.images && listing.images.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 mb-6">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.slice(1).map((img, i) => (
                <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img} alt={`${listing.title} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-6xl mb-6">
          {category?.icon ?? '📦'}
        </div>
      )}

      {/* Title & Price */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{listing.title}</h1>
          {listing.is_sold && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shrink-0">SOLD</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-3xl font-bold text-[#BF1F2E]">{formattedPrice}</span>
          {listing.is_negotiable && (
            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">Negotiable</span>
          )}
        </div>
      </div>

      {/* Meta Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {category?.icon} {category?.name}
        </span>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          🏷️ {listing.condition}
        </span>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          📍 {listing.location}, {listing.county}
        </span>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          👁 {listing.view_count} views
        </span>
      </div>

      {/* Description */}
      <div className="card p-4 mb-4">
        <h2 className="font-semibold text-gray-800 mb-2">Description</h2>
        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{listing.description}</p>
      </div>

      {/* Seller Card + Contact */}
      {!listing.is_sold && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Seller</p>
              <p className="font-semibold text-gray-800">{listing.seller_name ?? 'Anonymous'}</p>
              <p className="text-xs text-gray-400 mt-0.5">📍 {listing.seller_location}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#BF1F2E]/10 flex items-center justify-center text-2xl">
              👤
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {listing.seller_whatsapp && (
              <a
                href={`https://wa.me/${listing.seller_whatsapp.replace(/\D/g, '')}?text=Hi! I'm interested in your listing: ${encodeURIComponent(listing.title)} on LibMarket.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <span>💬</span> WhatsApp Seller
              </a>
            )}
            {listing.seller_phone && (
              <a
                href={`tel:${listing.seller_phone}`}
                className="flex items-center justify-center gap-2 bg-[#0B3D91] hover:bg-[#082d6b] text-white font-semibold py-3 px-5 rounded-xl transition-colors"
              >
                📞 Call
              </a>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">⚠️ Always meet in a safe public place. Never send money in advance.</p>
        </div>
      )}
    </div>
  );
}
