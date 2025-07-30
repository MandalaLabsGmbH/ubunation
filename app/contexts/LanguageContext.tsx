'use client'

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';

// Local fallback translation file content.
// This ensures that there are always translations available on initial render
// and provides a fallback if the remote fetch fails.
const localEnTranslations = {
  "login": "Login",
  "logout": "Logout",
  "donateAndGetNft": "Donate Now & Get Your ULT NFT",
  "discoverUbunation": "Discover UBUNΛTION: Uniting Hearts, Changing Lives –",
  "exploreCampaigns": "Explore Our Current Charity Campaigns!",
  "buyNow": "Buy Now",
  "choosePaymentMethod": "Choose Payment Method",
  "completeYourPurchase": "Complete Your Purchase",
  "paymentSuccessful": "Payment Successful!",
  "paymentFailed": "Payment Failed",
  "yourShoppingCart": "Your Shopping Cart"
};

// Define the URLs for your public translation files
const EN_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/locale/en.json';
const DE_JSON_URL = 'https://ubunation.s3.eu-central-1.amazonaws.com/locale/de.json';

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
  // Initialize state with the local English translations as a default/fallback
  const [translations, setTranslations] = useState<Translations>(localEnTranslations);
  const [isLoading, setIsLoading] = useState(false); // Set initial loading to false

  useEffect(() => {
    const savedLanguage = Cookies.get('app-language') as Language | undefined;
    const initialLang = (savedLanguage && ['en', 'de'].includes(savedLanguage)) ? savedLanguage : 'en';
    setLanguageState(initialLang);

    // Fetch translations for the initial language
    fetchTranslations(initialLang);
  }, []);

  const fetchTranslations = useCallback(async (lang: Language) => {
    setIsLoading(true);
    const url = lang === 'de' ? DE_JSON_URL : EN_JSON_URL;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch translations from ${url}. Status: ${response.status}`);
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error("Translation loading error:", error);
      // If the fetch fails, ensure the translations fall back to the local English version.
      setTranslations(localEnTranslations);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('app-language', lang, { expires: 365 });
    fetchTranslations(lang); // Fetch new translations when language changes
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

  // The provider now renders its children immediately, using the fallback
  // translations until a remote fetch completes. This prevents the page from hanging.
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
