import ListingCard from './ListingCard';
import type { Listing } from '@/lib/types';

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-8">
        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </div>
        <p className="text-[#222] font-bold text-lg mb-1">No items found nearby</p>
        <p className="text-[#888] text-sm">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
