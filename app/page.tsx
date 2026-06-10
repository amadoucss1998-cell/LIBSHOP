import { supabase } from '@/lib/supabase';
import CategoryBar from '@/components/CategoryBar';
import LoadMoreListings from '@/components/LoadMoreListings';
import Link from 'next/link';

export const revalidate = 30;

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categorySlug = searchParams.category;

  let categoryId: number | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) categoryId = cat.id;
  }

  let query = supabase
    .from('listings')
    .select('*, profiles(full_name, whatsapp_number, location), categories(name, icon, slug)')
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data: listings, error: listingsError } = await query;
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  const dbError = listingsError || categoriesError;

  return (
    <div className="max-w-2xl mx-auto">

      {!categorySlug && (
        <>
          {/* Hero banner */}
          <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-br from-[#F7501F] to-[#FF8C5A] overflow-hidden relative">
            <div className="px-5 py-6">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Liberia&apos;s marketplace</p>
              <h1 className="text-white text-2xl font-black leading-tight mb-3">
                Buy &amp; sell<br />anything near you
              </h1>
              <Link
                href="/listings/new"
                className="inline-flex items-center gap-2 bg-white text-[#F7501F] font-bold text-sm px-5 py-2.5 rounded-full shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Start selling
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-white/10" />
          </div>

          {/* Category grid */}
          {categories && categories.length > 0 && (
            <div className="px-4 mt-5">
              <h2 className="text-[#222] font-bold text-base mb-3">Browse categories</h2>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.slug}`}
                    className="flex flex-col items-center gap-1.5 bg-white rounded-xl py-3 px-1 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] font-semibold text-[#444] text-center leading-tight">{cat.name}</span>
                  </Link>
                ))}
                <Link
                  href="/?category=other"
                  className="flex flex-col items-center gap-1.5 bg-white rounded-xl py-3 px-1 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-[10px] font-semibold text-[#444] text-center leading-tight">More</span>
                </Link>
              </div>
            </div>
          )}

          {/* Divider + section heading */}
          <div className="px-4 mt-6 mb-1 flex items-center justify-between">
            <h2 className="text-[#222] font-bold text-base">Recent listings</h2>
            {listings && listings.length > 0 && (
              <span className="text-[#888] text-sm">{listings.length}{listings.length >= PAGE_SIZE ? '+' : ''} items</span>
            )}
          </div>
        </>
      )}

      {/* Category filter bar (shown when filtering) */}
      {categorySlug && (
        <div className="py-3">
          <CategoryBar categories={categories ?? []} activeSlug={categorySlug} />
        </div>
      )}

      {/* Horizontal scroll category bar always visible when not filtering */}
      {!categorySlug && (
        <div className="py-2">
          <CategoryBar categories={categories ?? []} activeSlug={undefined} />
        </div>
      )}

      {dbError ? (
        <div className="mx-4 bg-orange-50 border border-orange-200 rounded-xl p-5 text-sm text-orange-700 space-y-2">
          <p className="font-bold">⚠️ Database not set up yet</p>
          <p>Run <code className="bg-orange-100 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL Editor, then create a public <code className="bg-orange-100 px-1 rounded">listing-images</code> storage bucket.</p>
          <p className="text-orange-400 text-xs font-mono">{dbError.message}</p>
        </div>
      ) : (
        <>
          {categorySlug && (
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-[#222] font-bold text-base">
                {categories?.find(c => c.slug === categorySlug)?.icon}{' '}
                {categories?.find(c => c.slug === categorySlug)?.name ?? 'Listings'}
              </h2>
              <span className="text-[#888] text-sm">{listings?.length ?? 0}{(listings?.length ?? 0) >= PAGE_SIZE ? '+' : ''} items</span>
            </div>
          )}

          {listings && listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
                <span className="text-4xl">📭</span>
              </div>
              <p className="text-[#222] font-bold text-lg mb-1">No listings yet</p>
              <p className="text-[#888] text-sm mb-6">Be the first to post something{categorySlug ? ' in this category' : ''}!</p>
              <Link
                href="/listings/new"
                className="bg-[#F7501F] text-white font-bold px-8 py-3 rounded-xl text-sm"
              >
                Post a listing
              </Link>
            </div>
          ) : (
            <LoadMoreListings
              initialListings={listings ?? []}
              categoryId={categoryId}
            />
          )}
        </>
      )}
    </div>
  );
}
