'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-primary-600">
              {t('common.appName')}
            </span>
            <div className="flex items-center gap-3">
              {!loading && (
                user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="primary" size="sm">{t('nav.goToDashboard')}</Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin">
                        <Button variant="secondary" size="sm">{t('nav.adminPanel')}</Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm">{t('common.login')}</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="primary" size="sm">{t('common.register')}</Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t('landing.heroDescription')}
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/auth/register">
                <Button variant="primary" className="text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  {t('landing.getStarted')}
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  {t('landing.login')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-20">
          {/* Secure Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.secure')}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {t('landing.secureDesc')}
            </p>
          </div>

          {/* Real-time Rates Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.realTimeRates')}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {t('landing.realTimeRatesDesc')}
            </p>
          </div>

          {/* Easy to Use Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.easyToUse')}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {t('landing.easyToUseDesc')}
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 sm:mt-20 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12">{t('landing.howItWorks')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm sm:text-base">
                1
              </div>
              <h4 className="font-semibold mb-1 text-sm sm:text-base">{t('landing.step1Title')}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{t('landing.step1Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm sm:text-base">
                2
              </div>
              <h4 className="font-semibold mb-1 text-sm sm:text-base">{t('landing.step2Title')}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{t('landing.step2Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm sm:text-base">
                3
              </div>
              <h4 className="font-semibold mb-1 text-sm sm:text-base">{t('landing.step3Title')}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{t('landing.step3Desc')}</p>
            </div>
            <div className="text-center col-span-2 lg:col-span-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm sm:text-base">
                4
              </div>
              <h4 className="font-semibold mb-1 text-sm sm:text-base">{t('landing.step4Title')}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{t('landing.step4Desc')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 sm:mt-20 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm sm:text-base">
          <p>{t('landing.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}