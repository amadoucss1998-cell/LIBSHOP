'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import type { Listing, Profile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'sold'>('active');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return; }

      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('listings')
          .select('*, categories(name, icon, slug)')
          .eq('seller_id', data.user.id)
          .order('created_at', { ascending: false }),
      ]);

      setProfile(profileRes.data);
      setListings(listingsRes.data ?? []);
      setLoading(false);
    });
  }, [router]);

  const markSold = async (id: string) => {
    await supabase.from('listings').update({ is_sold: true }).eq('id', id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_sold: true } : l));
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').update({ is_active: false }).eq('id', id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;

  const activeListing = listings.filter((l) => !l.is_sold && l.is_active);
  const soldListings = listings.filter((l) => l.is_sold);
  const shown = tab === 'active' ? activeListing : soldListings;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card p-5 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#BF1F2E]/10 flex items-center justify-center text-3xl">
          👤
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{profile?.full_name}</h1>
          <p className="text-sm text-gray-500">📍 {profile?.location}</p>
          {profile?.whatsapp_number && (
            <p className="text-sm text-gray-500">📱 {profile.whatsapp_number}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-[#BF1F2E]">{activeListing.length}</p>
          <p className="text-sm text-gray-500">Active Listings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{soldListings.length}</p>
          <p className="text-sm text-gray-500">Items Sold</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/listings/new')}
        className="w-full btn-primary py-3 rounded-xl mb-5"
      >
        + Post New Ad
      </button>

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
        {(['active', 'sold'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
              tab === t ? 'bg-white text-[#BF1F2E] shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'active' ? `Active (${activeListing.length})` : `Sold (${soldListings.length})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">{tab === 'active' ? '📋' : '✅'}</p>
          <p>{tab === 'active' ? 'No active listings' : 'No sold items yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {shown.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} />
              {tab === 'active' && (
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => markSold(listing.id)}
                    className="flex-1 bg-green-100 text-green-700 text-xs py-1.5 rounded-lg font-medium hover:bg-green-200 transition-colors"
                  >
                    Mark Sold
                  </button>
                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="flex-1 bg-red-100 text-red-600 text-xs py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
