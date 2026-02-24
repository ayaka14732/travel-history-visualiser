/**
 * LocaleContext — provides the active locale and a setter throughout the app.
 * Persists the user's choice in localStorage under the key "locale".
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { LOCALES, LOCALE_ORDER, type Locale, type Translation } from "@/lib/i18n";

const STORAGE_KEY = "travel-history-locale";

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in LOCALES) return stored;
  // Browser language hint
  const lang = navigator.language;
  if (lang.startsWith("zh")) return "zh-TW";
  return "en-GB";
}

interface LocaleContextValue {
  locale: Locale;
  t: Translation;
  setLocale: (l: Locale) => void;
  localeOrder: Locale[];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const l = detectLocale();
    document.documentElement.lang = l;
    return l;
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const value: LocaleContextValue = {
    locale,
    t: LOCALES[locale],
    setLocale,
    localeOrder: LOCALE_ORDER,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
