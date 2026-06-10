import { supabase } from '@/lib/supabase';
import ListingGrid from '@/components/ListingGrid';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? '';

  let listings: any[] = [];
  if (query) {
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(full_name, whatsapp_number, location), categories(name, icon, slug)')
      .eq('is_active', true)
      .eq('is_sold', false)
      .textSearch('search_vector', query, { type: 'websearch' })
      .order('created_at', { ascending: false })
      .limit(40);
    listings = data ?? [];
  }

  return (
    <div className="max-w-2xl mx-auto">
      {query ? (
        <>
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-[#222] font-bold text-base">
              Results for <span className="text-[#F7501F]">&ldquo;{query}&rdquo;</span>
            </h2>
            <span className="text-[#888] text-sm">{listings.length} items</span>
          </div>
          <ListingGrid listings={listings} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>
          <p className="text-[#222] font-bold text-lg mb-1">Search for anything</p>
          <p className="text-[#888] text-sm">Type in the search bar above to find items near you</p>
        </div>
      )}
    </div>
  );
}
