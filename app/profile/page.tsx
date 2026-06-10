'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import type { Listing, Profile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<'active' | 'sold'>('active');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return; }

      setIsAuthenticated(true);
      setUserEmail(data.user.email ?? null);

      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('listings')
          .select('*, categories(name, icon, slug)')
          .eq('seller_id', data.user.id)
          .order('created_at', { ascending: false }),
      ]);

      setProfile(profileRes.data ?? null);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-3 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Not logged in (only show this if auth check confirmed no session)
  if (!isAuthenticated && !loading) return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="text-[#222] font-bold text-xl mb-2">Sign in to see your profile</h2>
      <p className="text-[#888] text-sm mb-6">Manage your listings, chat with buyers, and more.</p>
      <button
        onClick={() => router.push('/auth')}
        className="w-full bg-[#F7501F] text-white font-bold py-4 rounded-xl"
      >
        Sign in / Join theonline18
      </button>
    </div>
  );

  // Authenticated but profile row missing — show account info + logout
  if (!profile) return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F7501F]/10 flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-[#F7501F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="text-[#222] font-bold text-xl mb-1">You&apos;re signed in</h2>
      <p className="text-[#888] text-sm mb-8">{userEmail}</p>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-[#FFF5F5] border border-[#FFD0D0] text-[#E74C3C] font-bold py-3.5 rounded-xl"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </div>
  );

  const activeListing = listings.filter((l) => !l.is_sold && l.is_active);
  const soldListings = listings.filter((l) => l.is_sold);
  const shown = tab === 'active' ? activeListing : soldListings;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Profile header */}
      <div className="bg-white px-5 pt-5 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#F7501F]/10 flex items-center justify-center text-2xl font-black text-[#F7501F]">
            {profile.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-[#222] font-bold text-xl">{profile.full_name}</h1>
            <p className="text-[#888] text-sm flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {profile.location}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F5F5F5] rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#F7501F]">{activeListing.length}</p>
            <p className="text-[#888] text-xs font-semibold mt-0.5">Active</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#4CD964]">{soldListings.length}</p>
            <p className="text-[#888] text-xs font-semibold mt-0.5">Sold</p>
          </div>
        </div>
      </div>

      {/* Post CTA */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.push('/listings/new')}
          className="w-full bg-[#F7501F] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Sell something
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#F5F5F5] mx-4 rounded-xl p-1 mb-3">
        {(['active', 'sold'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              tab === t ? 'bg-white text-[#222] shadow-sm' : 'text-[#888]'
            }`}
          >
            {t === 'active' ? `Active (${activeListing.length})` : `Sold (${soldListings.length})`}
          </button>
        ))}
      </div>

      {/* Listings */}
      {shown.length === 0 ? (
        <div className="text-center py-16 text-[#888]">
          <p className="text-3xl mb-2">{tab === 'active' ? '📋' : '✅'}</p>
          <p className="font-semibold">{tab === 'active' ? 'No active listings' : 'Nothing sold yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-4">
          {shown.map((listing) => (
            <div key={listing.id}>
              <ListingCard listing={listing} />
              {tab === 'active' && (
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => markSold(listing.id)}
                    className="flex-1 bg-[#F5F5F5] text-[#222] text-xs py-2 rounded-lg font-bold hover:bg-[#ECECEC] transition-colors"
                  >
                    Mark sold
                  </button>
                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="flex-1 bg-[#FFF0F0] text-[#E74C3C] text-xs py-2 rounded-lg font-bold hover:bg-[#FFE0E0] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Logout button at bottom */}
      <div className="px-4 py-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-[#FFF5F5] border border-[#FFD0D0] text-[#E74C3C] font-bold py-3.5 rounded-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
      <div className="h-6" />
    </div>
  );
}
