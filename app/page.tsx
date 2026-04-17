'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('bmsa_auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        if (payload.exp > Date.now()) {
          router.push('/dashboard');
          return;
        } else {
          localStorage.removeItem('bmsa_auth_token');
        }
      } catch {
        localStorage.removeItem('bmsa_auth_token');
      }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('bmsa_auth_token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bmsa-red via-bmsa-red-dark to-[#4A0000]">
        <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bmsa-red via-bmsa-red-dark to-[#4A0000] p-4">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-bmsa-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white px-8 py-10 text-center">
            <img src="/BMSA Logo Horizontal.png" alt="BMSA" className="h-24 mx-auto object-contain mb-4" />
            <h1 className="text-2xl font-bold text-bmsa-red">Email Dashboard</h1>
            <p className="text-bmsa-text-light text-sm mt-1">President Access Only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-bmsa-text mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field text-base"
                autoFocus
                required
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-bmsa-gray-300 text-bmsa-red focus:ring-bmsa-red cursor-pointer"
              />
              <span className="text-sm text-bmsa-text-light group-hover:text-bmsa-text transition-colors">
                Remember this device
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-bmsa-text-light">
              Beni-Suef Medical Students' Association · BMSA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
