'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bmsa_auth_token');

    if (!token) {
      router.push('/');
      return;
    }

    // Verify token hasn't expired (client-side check)
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        localStorage.removeItem('bmsa_auth_token');
        router.push('/');
        return;
      }
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('bmsa_auth_token');
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bmsa-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-bmsa-text-light">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
