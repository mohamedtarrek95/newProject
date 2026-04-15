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
        className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 w-4 h-4 pointer-events-none text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}