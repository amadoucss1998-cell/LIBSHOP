'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Toast {
  id: string;
  senderName: string;
  content: string;
  convId: string;
}

export default function MessageNotifications() {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      userId = data.user.id;

      // Subscribe to all new messages where I am a participant
      const channel = supabase
        .channel('global_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          async (payload) => {
            const msg = payload.new as { id: string; conversation_id: string; sender_id: string; content: string };

            // Ignore my own messages
            if (msg.sender_id === userId) return;

            // Ignore if already viewing this conversation
            if (pathname === `/chats/${msg.conversation_id}`) return;

            // Check I am a participant
            const { data: conv } = await supabase
              .from('conversations')
              .select('buyer_id, seller_id, buyer:profiles!conversations_buyer_id_fkey(full_name), seller:profiles!conversations_seller_id_fkey(full_name)')
              .eq('id', msg.conversation_id)
              .single();

            if (!conv) return;
            if (conv.buyer_id !== userId && conv.seller_id !== userId) return;

            const sender = msg.sender_id === conv.buyer_id
              ? (conv.buyer as any)?.full_name
              : (conv.seller as any)?.full_name;

            const toast: Toast = {
              id: msg.id,
              senderName: sender ?? 'Someone',
              content: msg.content,
              convId: msg.conversation_id,
            };

            setToasts((prev) => [...prev.slice(-2), toast]); // max 3 toasts

            // Auto-dismiss after 4s
            setTimeout(() => removeToast(msg.id), 4000);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
  }, [pathname, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-[112px] left-0 right-0 z-50 flex flex-col gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <a
          key={toast.id}
          href={`/chats/${toast.convId}`}
          className="pointer-events-auto flex items-start gap-3 bg-[#222] text-white rounded-2xl px-4 py-3 shadow-xl animate-slide-down"
          onClick={() => removeToast(toast.id)}
        >
          <div className="w-8 h-8 rounded-full bg-[#F7501F] flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
            {toast.senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{toast.senderName}</p>
            <p className="text-white/70 text-xs truncate">{toast.content}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); removeToast(toast.id); }}
            className="text-white/50 text-lg leading-none flex-shrink-0 ml-1"
          >×</button>
        </a>
      ))}
    </div>
  );
}
