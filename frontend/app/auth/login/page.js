'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button, Input, Card, Alert } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-premium-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-premium-400 to-premium-600 flex items-center justify-center shadow-premium-glow">
              <svg className="w-6 h-6 text-surface-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">EGP-USDT</span>
          </Link>
        </div>

        <Card premium>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
            <p className="text-surface-400 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  {t('auth.loggingIn')}
                </span>
              ) : (
                t('common.login')
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-700">
            <p className="text-center text-surface-400 text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/auth/register" className="text-premium-400 hover:text-premium-300 font-semibold transition-colors duration-200">
                {t('common.register')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}