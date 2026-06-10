'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName.trim(),
            phone_number: phone.trim() || null,
            whatsapp_number: phone.trim() || null,
          });

          if (profileError) {
            // Profile failed — clean up the orphaned auth user
            await supabase.auth.admin?.deleteUser?.(data.user.id).catch(() => {});
            throw new Error('Failed to create profile. Please try again.');
          }

          setMessage('Account created! Check your email to confirm your account, then sign in.');
          setMode('login');
          setPassword('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      // Friendlier messages for common auth errors
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Please confirm your email first. Check your inbox for a verification link.');
      } else if (msg.includes('already registered')) {
        setError('An account with this email already exists. Sign in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-6">

      {/* Logo */}
      <div className="pt-12 pb-8 text-center">
        <span className="text-4xl font-black text-[#F7501F] tracking-tight">letgo</span>
        <p className="text-[#888] text-sm mt-2">Buy & sell near you</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#F5F5F5] rounded-xl p-1 mb-6">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              mode === m ? 'bg-white text-[#222] shadow-sm' : 'text-[#888]'
            }`}
          >
            {m === 'login' ? 'Sign in' : 'Join letgo'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        {mode === 'register' && (
          <>
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="WhatsApp number (e.g. +231 770 123 456)"
              className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
            />
          </>
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
        />

        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[#222] text-sm placeholder-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#F7501F]/30"
        />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-700 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F7501F] hover:bg-[#d94218] text-white font-bold py-4 rounded-xl text-sm transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[#bbb] text-xs py-8">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-[#F7501F] font-semibold"
        >
          {mode === 'login' ? 'Join letgo' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
