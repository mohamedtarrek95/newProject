'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' }
];

const LANGUAGE_KEY = 'preferred_language';

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      setLocale(stored);
    } else {
      localStorage.setItem(LANGUAGE_KEY, 'en');
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale, isInitialized]);

  const changeLanguage = (newLocale) => {
    if (!LANGUAGES.some(l => l.code === newLocale)) return;
    localStorage.setItem(LANGUAGE_KEY, newLocale);
    setLocale(newLocale);
  };

  const getLanguage = () => {
    return LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];
  };

  const isRTL = () => locale === 'ar';

  return (
    <LanguageContext.Provider value={{
      locale,
      setLocale: changeLanguage,
      languages: LANGUAGES,
      getLanguage,
      isRTL,
      isInitialized
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export { LANGUAGES };