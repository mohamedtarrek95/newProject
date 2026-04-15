'use client';

import { createContext, useContext, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

const messages = { en, ar };

const TranslationsContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function TranslationsProvider({ children }) {
  const { locale, isInitialized } = useLanguage();

  const value = useMemo(() => {
    const currentMessages = messages[locale] || messages.en;

    const t = (key, options = {}) => {
      let value = getNestedValue(currentMessages, key);

      if (value === undefined) {
        // Fallback to English if translation not found
        value = getNestedValue(messages.en, key);
      }

      if (value === undefined) {
        return key;
      }

      // Simple interpolation support
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(optKey => {
          value = value.replace(new RegExp(`\\{${optKey}\\}`, 'g'), options[optKey]);
        });
      }

      return value;
    };

    return {
      locale,
      t,
      messages: currentMessages
    };
  }, [locale]);

  // During SSR and initial hydration, use English as fallback
  const contextValue = isInitialized ? value : { locale: 'en', t: (key) => key, messages: messages.en };

  return (
    <TranslationsContext.Provider value={contextValue}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (!context) {
    // Return a fallback during SSR
    return {
      locale: 'en',
      t: (key) => key,
      messages: messages.en
    };
  }
  return context;
}

export default TranslationsProvider;