import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(full_name, whatsapp_number, phone_number, location, created_at), categories(name, icon)')
    .eq('id', params.id)
    .single();

  if (!listing) notFound();

  await supabase.from('listings').update({ view_count: listing.view_count + 1 }).eq('id', params.id);

  const seller = (listing as any).profiles;
  const category = (listing as any).categories;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(listing.price);

  const memberSince = seller?.created_at
    ? new Date(seller.created_at).getFullYear()
    : '—';

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
              {listing.images.slice(1).map((img: string, i: number) => (
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
              <p className="font-semibold text-gray-800">{seller?.full_name ?? 'Anonymous'}</p>
              <p className="text-xs text-gray-400 mt-0.5">📍 {seller?.location} · Member since {memberSince}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#BF1F2E]/10 flex items-center justify-center text-2xl">
              👤
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {seller?.whatsapp_number && (
              <a
                href={`https://wa.me/${seller.whatsapp_number.replace(/\D/g, '')}?text=Hi! I'm interested in your listing: ${encodeURIComponent(listing.title)} on LibMarket.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <span>💬</span> WhatsApp Seller
              </a>
            )}
            {seller?.phone_number && (
              <a
                href={`tel:${seller.phone_number}`}
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
