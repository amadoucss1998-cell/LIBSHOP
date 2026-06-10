'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { REPORT_REASONS, type ReportReason } from '@/lib/types';

export default function ReportButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth'); return; }

    setLoading(true);
    await supabase.from('reports').insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      details: details.trim() || null,
    });
    setDone(true);
    setLoading(false);
    setTimeout(() => { setOpen(false); setDone(false); }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[#888] text-sm font-medium px-2 py-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            {done ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-[#222]">Report submitted</p>
                <p className="text-[#888] text-sm mt-1">Thank you for helping keep theonline18 safe.</p>
              </div>
            ) : (
              <form onSubmit={handleReport}>
                <h2 className="font-bold text-[#222] text-lg mb-4">Report this listing</h2>
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-[#F7501F]"
                      />
                      <span className="text-sm text-[#222]">{r.label}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={2}
                  className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#222] placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30 resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 rounded-xl bg-[#F5F5F5] text-[#444] font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-[#F7501F] text-white font-bold text-sm disabled:opacity-50">
                    {loading ? 'Sending...' : 'Submit report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
