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
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;

        setMessage('Account created! Check your email to confirm your account, then sign in.');
        setMode('login');
        setPassword('');
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
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
        <span className="text-4xl font-black text-[#F7501F] tracking-tight">theonline18</span>
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
            {m === 'login' ? 'Sign in' : 'Join theonline18'}
          </button>
        ))}
      </div>

      {/* Google sign-in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-[#E8E8E8] rounded-xl py-3.5 text-sm font-semibold text-[#222] hover:bg-[#F9F9F9] transition-colors disabled:opacity-50 mb-4"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E8E8E8]" />
        <span className="text-[#bbb] text-xs font-medium">or</span>
        <div className="flex-1 h-px bg-[#E8E8E8]" />
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
          {mode === 'login' ? 'Join theonline18' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
