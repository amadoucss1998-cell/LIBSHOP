import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import ListingActions from '@/components/ListingActions';
import ReportButton from '@/components/ReportButton';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, whatsapp_number, phone_number, location, created_at), categories(name, icon)')
    .eq('id', params.id)
    .single();

  if (!listing) notFound();

  // ── View deduplication via cookie (anonymous) ───────────────────────────
  const cookieStore = cookies();
  const viewKey = `viewed_${params.id}`;
  const alreadyViewed = cookieStore.has(viewKey);

  if (!alreadyViewed) {
    // upsert with ignoreDuplicates avoids errors on re-visits
    await supabase
      .from('listing_views')
      .upsert(
        { listing_id: params.id, viewer_ip: 'server' },
        { ignoreDuplicates: true }
      );
  }

  const seller = listing.profiles as any;
  const category = listing.categories as any;
  const isFree = listing.price === 0;

  const formattedPrice = isFree
    ? 'Free'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(listing.price);

  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  // Get current user to show owner controls
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === listing.seller_id;

  return (
    <>
      {/* Set view cookie for 24h — done via response header in middleware, here via meta trick */}
      <div className="max-w-2xl mx-auto bg-white min-h-screen">

        {/* Back + Owner actions */}
        <div className="sticky top-[104px] z-10 bg-white/90 backdrop-blur-sm border-b border-[#F0F0F0] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 text-[#222]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && <ListingActions listingId={listing.id} isSold={listing.is_sold} />}
            {!isOwner && <ReportButton listingId={listing.id} />}
          </div>
        </div>

        {/* Image Gallery */}
        {listing.images && listing.images.length > 0 ? (
          <div>
            <div className="relative aspect-square bg-[#F5F5F5]">
              <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" priority />
              {listing.is_sold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-[#222] font-black text-lg px-5 py-2 rounded uppercase tracking-wider">Sold</span>
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white scrollbar-hide">
                {listing.images.map((img: string, i: number) => (
                  <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]">
                    <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center text-7xl">
            {category?.icon ?? '📦'}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 space-y-4">

          {/* Price + title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-3xl font-black ${isFree ? 'text-[#4CD964]' : 'text-[#222]'}`}>{formattedPrice}</span>
              {listing.is_negotiable && !isFree && (
                <span className="bg-[#F5F5F5] text-[#888] text-xs px-2 py-0.5 rounded-full font-semibold">Negotiable</span>
              )}
            </div>
            <h1 className="text-[#222] text-xl font-bold leading-snug">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[#888] text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {listing.location}, {listing.county}
              </span>
              <span>·</span>
              <span>{listing.condition}</span>
              <span>·</span>
              <span>{listing.view_count} views</span>
              {listing.save_count > 0 && (
                <>
                  <span>·</span>
                  <span>{listing.save_count} saved</span>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#F5F5F5] text-[#444] text-xs px-3 py-1.5 rounded-full font-medium">{category?.icon} {category?.name}</span>
            <span className="bg-[#F5F5F5] text-[#444] text-xs px-3 py-1.5 rounded-full font-medium">{listing.condition}</span>
          </div>

          <div className="border-t border-[#F0F0F0]" />

          {/* Description */}
          <div>
            <h2 className="text-[#222] font-bold mb-2">Description</h2>
            <p className="text-[#555] text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="border-t border-[#F0F0F0]" />

          {/* Seller */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F7501F]/10 flex items-center justify-center text-lg font-black text-[#F7501F]">
              {seller?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#222] font-bold text-sm truncate">{seller?.full_name ?? 'Anonymous'}</p>
              <p className="text-[#888] text-xs">Member since {memberSince} · {seller?.location}</p>
            </div>
          </div>

          {/* Safety tip */}
          <div className="bg-[#FFF8F0] border border-[#FFD9C2] rounded-xl p-3 flex gap-2">
            <span className="text-base">🛡️</span>
            <p className="text-[#A05020] text-xs leading-relaxed">
              <strong>Meet safely.</strong> Always meet in a public place, never pay in advance, and don&apos;t share personal financial information.
            </p>
          </div>
        </div>

        {/* Sticky contact bar */}
        {!listing.is_sold && !isOwner && (
          <div className="sticky bottom-16 bg-white border-t border-[#E8E8E8] px-4 py-3 flex gap-3">
            {seller?.whatsapp_number && (
              <a
                href={`https://wa.me/${seller.whatsapp_number.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(`Hi! I saw your listing "${listing.title}" on theonline18 and I'm interested. Is it still available?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#F7501F] text-white font-bold py-3.5 rounded-xl text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            )}
            {seller?.phone_number && (
              <a
                href={`tel:${seller.phone_number}`}
                className="flex items-center justify-center gap-2 bg-[#F5F5F5] text-[#222] font-bold py-3.5 px-5 rounded-xl text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}
          </div>
        )}

        {/* Owner bar */}
        {isOwner && !listing.is_sold && (
          <div className="sticky bottom-16 bg-white border-t border-[#E8E8E8] px-4 py-3">
            <p className="text-center text-[#888] text-xs">This is your listing — use the menu above to edit or mark as sold.</p>
          </div>
        )}
      </div>
    </>
  );
}
