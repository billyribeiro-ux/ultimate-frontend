/**
 * i18n configuration — supported locales, default locale, and type definitions.
 */

export const SUPPORTED_LOCALES = ['en', 'pt-BR', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
	en: 'English',
	'pt-BR': 'Portugues (Brasil)',
	ar: 'العربية'
};

export const LOCALE_DIRECTIONS: Record<SupportedLocale, 'ltr' | 'rtl'> = {
	en: 'ltr',
	'pt-BR': 'ltr',
	ar: 'rtl'
};

/**
 * BCP 47 language tag validation.
 * Checks if a string is a valid language tag format (not exhaustive).
 */
export function isValidLocale(value: string): value is SupportedLocale {
	return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
