'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const convId = params.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth'); return; }
      const uid = data.user.id;
      setUserId(uid);

      const { data: conv } = await supabase
        .from('conversations')
        .select(`*, listings(id, title, images, price, is_sold), buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url)`)
        .eq('id', convId)
        .single();

      if (!conv || (conv.buyer_id !== uid && conv.seller_id !== uid)) {
        router.replace('/chats');
        return;
      }
      setConversation(conv as Conversation);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      setMessages((msgs as Message[]) ?? []);
      setLoading(false);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', uid)
        .eq('is_read', false);
    });
  }, [convId, router]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (userId && newMsg.sender_id !== userId) {
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [convId, userId]);

  useEffect(() => {
    if (!loading) scrollToBottom('instant');
  }, [loading, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input]);

  async function sendMessage() {
    if (!input.trim() || !userId || !conversation || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: userId,
      content,
    });

    if (!error) {
      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', convId);
    }
    setSending(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F7501F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversation || !userId) return null;

  const isBuyer = conversation.buyer_id === userId;
  const otherParty = isBuyer ? conversation.seller : conversation.buyer;
  const listing = conversation.listings;
  const thumb = listing?.images?.[0];
  const formattedPrice = listing?.price === 0
    ? 'Free'
    : listing?.price != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(listing.price)
      : '';

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ height: 'calc(100dvh - 104px - 64px)' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-[#F0F0F0] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#222] p-1 -ml-1 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-[#F7501F]/10 flex items-center justify-center text-sm font-black text-[#F7501F] flex-shrink-0">
          {otherParty?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#222] font-bold text-sm truncate">{otherParty?.full_name ?? 'Unknown'}</p>
          {listing?.title && <p className="text-[#888] text-xs truncate">{listing.title}</p>}
        </div>
      </div>

      {/* ── Scrollable messages area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Listing card */}
        {listing && (
          <div className="px-4 pt-3 pb-1">
            <Link
              href={`/listings/${listing.id}`}
              className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border border-[#F0F0F0]"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                {thumb ? (
                  <Image src={thumb} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#222] font-semibold text-sm truncate">{listing.title}</p>
                <p className="text-[#F7501F] font-bold text-sm">{formattedPrice}</p>
              </div>
              {listing.is_sold && (
                <span className="text-xs bg-[#F5F5F5] text-[#888] px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Sold</span>
              )}
            </Link>
          </div>
        )}

        {/* Messages */}
        <div className="px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-[#888] text-sm py-10">No messages yet — say hello!</p>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === userId;
            const showTime = i === messages.length - 1 ||
              new Date(messages[i + 1].created_at).getTime() - new Date(msg.created_at).getTime() > 5 * 60 * 1000;

            return (
              <div key={msg.id}>
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] sm:max-w-[60%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isMine
                      ? 'bg-[#F7501F] text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-[#222] rounded-2xl rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
                {showTime && (
                  <p className={`text-[10px] text-[#aaa] mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-[#E8E8E8] px-4 py-3 flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none bg-[#F5F5F5] rounded-2xl px-4 py-2.5 text-sm text-[#222] placeholder-[#aaa] outline-none focus:ring-2 focus:ring-[#F7501F]/30 overflow-hidden"
          style={{ lineHeight: '1.5', maxHeight: '96px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-[#F7501F] flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

    </div>
  );
}
