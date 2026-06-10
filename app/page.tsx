import { supabase } from '@/lib/supabase';
import ListingGrid from '@/components/ListingGrid';
import CategoryBar from '@/components/CategoryBar';
import Link from 'next/link';

export const revalidate = 60;

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
    categoryId = cat?.id ?? null;
  }

  let query = supabase
    .from('listings')
    .select('*, profiles(full_name, whatsapp_number, location), categories(name, icon, slug)')
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .limit(40);

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data: listings } = await query;

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

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

      <CategoryBar categories={categories ?? []} activeSlug={categorySlug} />

      <h2 className="text-lg font-bold text-gray-800 mb-3 mt-4">
        {categorySlug ? `${categories?.find(c => c.slug === categorySlug)?.name ?? ''} Listings` : 'Recent Listings'}
      </h2>
      <ListingGrid listings={listings ?? []} />
    </div>
  );
}
