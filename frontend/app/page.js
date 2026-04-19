'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui';
import { useTranslations } from '@/components/TranslationsProvider';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Navigation */}
      <nav className="bg-surface-800/80 backdrop-blur-xl border-b border-surface-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-premium-400 to-premium-600 flex items-center justify-center shadow-premium-glow group-hover:shadow-premium-glow-lg transition-shadow duration-200">
                <svg className="w-5 h-5 text-surface-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-surface-300 bg-clip-text text-transparent">
                {t('common.appName')}
              </span>
            </Link>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-900 to-surface-800" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-premium-500/10 rounded-full blur-[120px]" />

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800 border border-surface-700 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-surface-300">{t('landing.secureReliableExchange')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-white">{t('landing.heroTitle')}</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-surface-400 mb-8 max-w-2xl mx-auto px-4">
              {t('landing.heroDescription')}
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                    {t('landing.getStarted')}
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                    {t('landing.login')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20">
            {/* Secure Card */}
            <div className="card-premium group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary-500/30 group-hover:to-primary-600/30 transition-all duration-200">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white text-center">{t('landing.secure')}</h3>
              <p className="text-surface-400 text-center">
                {t('landing.secureDesc')}
              </p>
            </div>

            {/* Real-time Rates Card */}
            <div className="card-premium group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:from-emerald-500/30 group-hover:to-emerald-600/30 transition-all duration-200">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white text-center">{t('landing.realTimeRates')}</h3>
              <p className="text-surface-400 text-center">
                {t('landing.realTimeRatesDesc')}
              </p>
            </div>

            {/* Easy to Use Card */}
            <div className="card-premium group hover:scale-[1.02] transition-transform duration-200 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-200">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white text-center">{t('landing.easyToUse')}</h3>
              <p className="text-surface-400 text-center">
                {t('landing.easyToUseDesc')}
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 sm:mt-20 card-premium">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-white">{t('landing.howItWorks')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { num: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
                { num: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
                { num: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
                { num: '4', title: t('landing.step4Title'), desc: t('landing.step4Desc') }
              ].map((step, idx) => (
                <div key={idx} className="text-center relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-premium-400 to-premium-600 text-surface-900 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-premium-glow">
                    {step.num}
                  </div>
                  <h4 className="font-semibold mb-2 text-white text-sm sm:text-base">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-surface-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8 sm:py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-surface-500 text-sm sm:text-base">
          <p>{t('landing.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}