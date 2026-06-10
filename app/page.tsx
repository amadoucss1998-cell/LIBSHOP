import { supabase } from '@/lib/supabase';
import ListingGrid from '@/components/ListingGrid';
import CategoryBar from '@/components/CategoryBar';

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

  const { data: listings, error: listingsError } = await query;
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const dbError = listingsError || categoriesError;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Category bar */}
      <div className="py-3">
        <CategoryBar categories={categories ?? []} activeSlug={categorySlug} />
      </div>

      {dbError ? (
        <div className="mx-4 bg-orange-50 border border-orange-200 rounded-xl p-5 text-sm text-orange-700 space-y-2">
          <p className="font-bold">⚠️ Database not set up yet</p>
          <p>Run <code className="bg-orange-100 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL Editor, then create a public <code className="bg-orange-100 px-1 rounded">listing-images</code> storage bucket.</p>
          <p className="text-orange-400 text-xs font-mono">{dbError.message}</p>
        </div>
      ) : (
        <>
          {/* Section header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-[#222] font-bold text-base">
              {categorySlug
                ? `${categories?.find(c => c.slug === categorySlug)?.name ?? ''}`
                : 'Items near you'}
            </h2>
            <span className="text-[#888] text-sm">{listings?.length ?? 0} items</span>
          </div>

          <ListingGrid listings={listings ?? []} />
        </>
      )}
    </div>
  );
}
