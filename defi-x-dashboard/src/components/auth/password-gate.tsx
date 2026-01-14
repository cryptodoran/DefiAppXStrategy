'use client';

import { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const CORRECT_PASSWORD = 'sesame';
const AUTH_KEY = 'defi-app-auth';

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  // Show loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600" />
        </div>
      </div>
    );
  }

  // Show password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <span className="text-lg font-bold text-white">D</span>
            </div>
            <span className="text-xl font-semibold text-white">Defi App</span>
          </div>

          {/* Password Form */}
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-violet-400" />
              <h1 className="text-lg font-semibold text-white">Protected Access</h1>
            </div>

            <p className="text-sm text-tertiary mb-6">
              Enter the password to access the dashboard.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg bg-base border border-white/10 text-white placeholder-tertiary focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                autoFocus
              />

              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                className="w-full mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium flex items-center justify-center gap-2 hover:from-violet-600 hover:to-indigo-700 transition-colors"
              >
                Enter
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-tertiary mt-6">
            Defi App X Strategy Dashboard
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, show children
  return <>{children}</>;
}
