import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LocaleContextData {
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Record<string, any>;
}

const LocaleContext = createContext<LocaleContextData | undefined>(undefined);

const translations: Record<string, Record<string, any>> = {
  pt: {
    common: require('../locales/pt/common.json'),
    phases: require('../locales/pt/phases.json'),
  },
  en: {
    common: require('../locales/en/common.json'),
    phases: require('../locales/en/phases.json'),
  },
} as const;

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'pt' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('repoobra:lang');
      return saved === 'en' ? 'en' : 'pt';
    } catch {
      return 'pt';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('repoobra:lang', language);
    } catch {
      // storage indisponível
    }
  }, [language]);

  const translationsForLang = translations[language];

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Busca em todos os domínios de tradução
      for (const domain of Object.values(translationsForLang)) {
        const keys = key.split('.');
        let value: any = domain;
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) break;
        }
        if (typeof value === 'string') {
          let result = value;
          if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
              result = result.replace(`{${paramKey}}`, String(paramValue));
            }
          }
          return result;
        }
      }
      // Fallback: retorna a própria chave se não encontrar tradução
      return key;
    },
    [translationsForLang]
  );

  const setLanguage = useCallback((lang: 'pt' | 'en') => {
    setLanguageState(lang);
  }, []);

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t, translations: translationsForLang }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextData => {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale deve ser usado dentro de LocaleProvider');
  }
  return ctx;
};
