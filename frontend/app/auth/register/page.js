'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button, Input, Card } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useTranslations();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t('auth.registerTitle')}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('auth.firstName')}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
            />
            <Input
              label={t('auth.lastName')}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
            />
          </div>

          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('common.register')}
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm sm:text-base">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
            {t('common.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}