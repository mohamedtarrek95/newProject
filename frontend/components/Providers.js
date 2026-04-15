'use client';

import { AuthProvider } from '@/context/AuthProvider';
import { LanguageProvider } from '@/context/LanguageProvider';
import TranslationsProvider from '@/components/TranslationsProvider';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TranslationsProvider>
          {children}
        </TranslationsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
