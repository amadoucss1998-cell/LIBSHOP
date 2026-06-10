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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">
        Search results for <span className="text-[#BF1F2E]">&ldquo;{query}&rdquo;</span>
      </h1>
      <p className="text-sm text-gray-400 mb-5">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
      <ListingGrid listings={listings} />
    </div>
  );
}
