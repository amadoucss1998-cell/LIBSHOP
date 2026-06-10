'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Props {
  listingId: string;
  initialSaved?: boolean;
  inline?: boolean; // when true, renders as inline button (not absolutely positioned)
}

export default function SaveButton({ listingId, initialSaved = false, inline = false }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    // 1. Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    try {
      if (saved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);

        if (error) throw error;
        setSaved(false);
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_listings')
          .insert({ user_id: userId, listing_id: listingId });

        if (error) throw error;
        setSaved(true);
      }
    } catch (err: any) {
      console.error('Save failed:', err?.message ?? err);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${inline ? 'relative' : 'absolute top-2 right-2 z-20'} w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform disabled:opacity-60`}
      aria-label={saved ? 'Remove from saved' : 'Save'}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin text-[#F7501F]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg
          className={`w-4 h-4 ${saved ? 'text-[#F7501F]' : 'text-[#aaa]'}`}
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}
