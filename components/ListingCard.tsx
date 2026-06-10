import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const mainImage = listing.images?.[0];
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(listing.price);

  return (
    <Link href={`/listings/${listing.id}`} className="card hover:shadow-md transition-shadow block">
      <div className="relative aspect-square bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            {(listing as any).categories?.icon ?? '📦'}
          </div>
        )}
        {listing.is_sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">SOLD</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium text-gray-700">
          {listing.condition}
        </span>
      </div>

      <div className="p-3">
        <p className="text-[#BF1F2E] font-bold text-base">
          {formattedPrice}
          {listing.is_negotiable && <span className="text-xs font-normal text-gray-500 ml-1">(neg.)</span>}
        </p>
        <p className="text-gray-800 text-sm font-medium truncate mt-0.5">{listing.title}</p>
        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
          <span>📍</span>
          <span>{listing.location}</span>
          <span>·</span>
          <span>{timeAgo(listing.created_at)}</span>
        </p>
      </div>
    </Link>
  );
}
