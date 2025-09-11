'use client'

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';

// A minimal, hardcoded fallback in case both remote and local fetches fail
const emergencyTranslations = {
  "login": "Login",
  "buyNow": "Buy Now",
  "featuredProjectTitle": "Featured Project",
  "aboutTitle": "About UBUNɅTION",
  "projectsTitle": "Our Projects",
  "donatorsTitle": "Last Donators"
};

// Define the URLs for your public translation files
const EN_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/locale/en.jsonnn';
const DE_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/locale/de.jsonnn';

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
  const [translations, setTranslations] = useState<Translations>(emergencyTranslations);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langFromUrl = searchParams.get('language') as Language | null;

    if (langFromUrl && ['en', 'de'].includes(langFromUrl)) {
      setLanguage(langFromUrl);
      return;
    }

    const savedLanguage = Cookies.get('app-language') as Language | undefined;
    if (savedLanguage && ['en', 'de'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      const remoteUrl = language === 'de' ? DE_JSON_URL : EN_JSON_URL;
      const localUrl = language === 'de' ? '/locale/de.json' : '/locale/en.json';

      // --- More Robust Fetching Logic ---

      // 1. Attempt to fetch from remote URL
      try {
        const response = await fetch(remoteUrl, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
          setIsLoading(false);
          return; // Success, exit the function
        }
        // If response is not ok (e.g., 404), log it and fall through to the next step
        console.warn(`Remote fetch failed with status ${response.status}. Falling back to local.`);
      } catch (error) {
        // This catches network errors (e.g., DNS, CORS, offline)
        console.warn("Remote fetch failed with a network error. Falling back to local.", error);
      }

      // 2. If remote fetch failed, attempt to fetch from local public URL
      try {
        const localResponse = await fetch(localUrl);
        if (localResponse.ok) {
          const localData = await localResponse.json();
          setTranslations(localData);
          setIsLoading(false);
          return; // Success, exit the function
        }
        console.error(`Local fallback failed with status ${localResponse.status}. Using emergency translations.`);
      } catch (localError) {
        console.error("Local fallback failed with a network error. Using emergency translations.", localError);
      }

      // 3. If both fetches fail, use the hardcoded emergency translations
      setTranslations(emergencyTranslations);
      setIsLoading(false);
    };

    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('app-language', lang, { expires: 365 });
  };

  const translate = useCallback((key: string): string => {
    // Return the key itself as a fallback if the key doesn't exist in the loaded translations
    return translations[key] || key;
  }, [translations]);

  const value = {
    language,
    translations,
    setLanguage,
    translate,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}