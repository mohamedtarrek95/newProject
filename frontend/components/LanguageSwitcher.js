'use client';

import { useLanguage, LANGUAGES } from '@/context/LanguageProvider';
import { clsx } from 'clsx';

export default function LanguageSwitcher({ className }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={clsx('relative inline-flex items-center', className)}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="appearance-none bg-surface-700/50 border border-surface-600 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-surface-200 hover:border-surface-500 focus:outline-none focus:ring-2 focus:ring-premium-500 cursor-pointer transition-all duration-200"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-surface-800">
            {lang.name}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 w-4 h-4 pointer-events-none text-surface-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}