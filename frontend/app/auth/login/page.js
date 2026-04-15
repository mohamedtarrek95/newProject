'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button, Input, Card } from '@/components/ui';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t('auth.loginTitle')}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="********"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('common.login')}
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm sm:text-base">
          {t('auth.dontHaveAccount')}{' '}
          <Link href="/auth/register" className="text-primary-600 hover:underline font-medium">
            {t('common.register')}
          </Link>
        </p>
      </Card>
    </div>
  );
}