'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ListingActions({ listingId, isSold }: { listingId: string; isSold: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMarkSold = async () => {
    setLoading(true);
    await supabase.from('listings').update({ is_sold: true }).eq('id', listingId);
    setOpen(false);
    router.refresh();
    setLoading(false);
  };

  const handleMarkActive = async () => {
    setLoading(true);
    await supabase.from('listings').update({ is_sold: false }).eq('id', listingId);
    setOpen(false);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setLoading(true);
    await supabase.from('listings').update({ is_active: false }).eq('id', listingId);
    router.push('/profile');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-[#F5F5F5] rounded-full px-3 py-1.5 text-[#222] text-sm font-semibold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
        Manage
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl border border-[#E8E8E8] min-w-[180px] overflow-hidden">
            {!isSold ? (
              <button
                onClick={handleMarkSold}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#222] hover:bg-[#F5F5F5] transition-colors"
              >
                <span>✅</span> Mark as Sold
              </button>
            ) : (
              <button
                onClick={handleMarkActive}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#222] hover:bg-[#F5F5F5] transition-colors"
              >
                <span>🔄</span> Mark as Active
              </button>
            )}
            <div className="border-t border-[#F0F0F0]" />
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <span>🗑️</span> Delete listing
            </button>
          </div>
        </>
      )}
    </div>
  );
}
