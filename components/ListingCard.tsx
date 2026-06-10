'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, toggleSaveListing } from '@/lib/supabase';
import type { Listing } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  listing: Listing;
  initialSaved?: boolean;
}

export default function ListingCard({ listing, initialSaved = false }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const mainImage = listing.images?.[0];
  const isFree = listing.price === 0;
  const cat = (listing as any).categories;

  const formattedPrice = isFree
    ? 'Free'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(listing.price);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const result = await toggleSaveListing(listing.id);
    if (result === 'unauthenticated') {
      router.push('/auth');
    } else if (result !== 'error') {
      setSaved(result);
    }
    setSaving(false);
  };

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-[#F5F5F5]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {cat?.icon ?? '📦'}
            </div>
          )}

          {listing.is_sold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-[#222] font-black text-sm px-3 py-1 rounded uppercase tracking-wider">Sold</span>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-gradient-to-t from-black/65 to-transparent">
            <span className={`font-black text-white text-base leading-none ${isFree ? 'text-[#4CD964]' : ''}`}>
              {formattedPrice}
            </span>
            {listing.is_negotiable && !isFree && (
              <span className="text-white/70 text-xs ml-1">· neg.</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-2.5 pt-2 pb-2.5">
          <p className="text-[#222] text-sm font-semibold truncate leading-snug">{listing.title}</p>
          <p className="text-[#888] text-xs mt-0.5 truncate">
            {listing.location} · {timeAgo(listing.created_at)}
          </p>
        </div>
      </Link>

      {/* Heart / Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm transition-transform active:scale-90"
        aria-label={saved ? 'Remove from saved' : 'Save item'}
      >
        <svg
          className={`w-4 h-4 transition-colors ${saved ? 'text-[#F7501F]' : 'text-[#888]'}`}
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
