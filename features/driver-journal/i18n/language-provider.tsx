'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'en' | 'uk';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const STORAGE_KEY = 'driver-journal-language';

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function DriverJournalLanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (savedLanguage === 'en' || savedLanguage === 'uk') {
      setLanguage(savedLanguage);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language, isLoaded]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
