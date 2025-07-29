'use client'

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';

// Define the URLs for your public translation files
const EN_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/en.json';
const DE_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/de.json';

type Language = 'en' | 'de';
type Translations = Record<string, string>;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLanguage = Cookies.get('app-language') as Language | undefined;
    if (savedLanguage && ['en', 'de'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Set default language if no cookie is found
      setLanguageState('en');
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      const url = language === 'de' ? DE_JSON_URL : EN_JSON_URL;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch translations from ${url}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Translation loading error:", error);
        // Fallback to an empty object in case of an error
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('app-language', lang, { expires: 365 });
  };

  const translate = useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  const value = {
    language,
    translations,
    setLanguage,
    translate,
    isLoading,
  };

  // Render a loading state or null while translations are being fetched
  if (isLoading) {
    return null; 
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
