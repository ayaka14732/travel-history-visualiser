/**
 * i18n registry (display order in the language selector follows key order)
 *
 * To add a new language:
 *   1. Create client/src/lib/i18n/<locale>.ts implementing Translation
 *   2. Add the locale to the `Locale` union in types.ts
 *   3. Import and register it in LOCALES below
 */

import type { Locale, Translation } from './types';
import zhTW from './zh-TW';
import enGB from './en-GB';
import frCH from './fr-CH';
import daDK from './da-DK';

// ── Registry ─────────────────────────────────────────────────────────────────
export const LOCALES: Record<Locale, Translation> = {
  'zh-TW': zhTW,
  'en-GB': enGB,
  'fr-CH': frCH,
  'da-DK': daDK,
};

export type { Locale, Translation };
