'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (searchParams.get('mode') === 'register') setMode('register');
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        // If email confirmation is disabled, session is returned immediately.
        // If not, sign them in directly.
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
        router.push('/');
        router.refresh();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
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
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto px-6">

      {/* Logo */}
      <div className="pt-12 pb-8 text-center">
        <span className="text-4xl font-black text-[#F7501F] tracking-tight">theonline18</span>
        <p className="text-[#888] text-sm mt-2">Your last stop to buying and selling second hand items</p>
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
            {m === 'login' ? 'Sign in' : 'Join theonline18'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        {mode === 'register' && (
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
          {mode === 'login' ? 'Join theonline18' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
