/**
 * Locale detection utility.
 * Determines the user's preferred locale from multiple sources with priority ordering.
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, type SupportedLocale } from './config.js';

export type LocaleSource = 'url' | 'cookie' | 'accept-language' | 'default';

export interface DetectionResult {
	locale: SupportedLocale;
	source: LocaleSource;
}

/**
 * Detects locale from a URL path prefix like /en/about or /pt-BR/pricing.
 */
export function detectFromURL(pathname: string): SupportedLocale | null {
	const segments: string[] = pathname.split('/').filter(Boolean);
	const first: string | undefined = segments[0];

	if (first && isValidLocale(first)) {
		return first;
	}

	return null;
}

/**
 * Detects locale from a cookie value (typically "locale=en").
 */
export function detectFromCookie(cookieHeader: string | null): SupportedLocale | null {
	if (!cookieHeader) return null;

	const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)locale=([^;]+)/);
	if (match && match[1] && isValidLocale(match[1])) {
		return match[1];
	}

	return null;
}

/**
 * Detects locale from the Accept-Language header.
 * Parses quality values and finds the best match among supported locales.
 */
export function detectFromAcceptLanguage(header: string | null): SupportedLocale | null {
	if (!header) return null;

	const entries: Array<{ locale: string; quality: number }> = header
		.split(',')
		.map((part) => {
			const [locale = '', qualityStr = ''] = part.trim().split(';q=');
			const quality: number = qualityStr ? parseFloat(qualityStr) : 1.0;
			return { locale: locale.trim(), quality };
		})
		.sort((a, b) => b.quality - a.quality);

	for (const entry of entries) {
		// Exact match
		if (isValidLocale(entry.locale)) {
			return entry.locale;
		}

		// Language-only match (e.g., "pt" matches "pt-BR")
		const lang: string = entry.locale.split('-')[0] ?? '';
		const match: SupportedLocale | undefined = SUPPORTED_LOCALES.find(
			(supported) => supported === lang || supported.startsWith(lang + '-')
		);

		if (match) {
			return match;
		}
	}

	return null;
}

/**
 * Main locale detection function.
 * Priority: URL > cookie > Accept-Language > default.
 */
export function detectLocale(options: {
	pathname?: string;
	cookie?: string | null;
	acceptLanguage?: string | null;
}): DetectionResult {
	const { pathname, cookie, acceptLanguage } = options;

	if (pathname) {
		const fromURL = detectFromURL(pathname);
		if (fromURL) return { locale: fromURL, source: 'url' };
	}

	if (cookie !== undefined) {
		const fromCookie = detectFromCookie(cookie);
		if (fromCookie) return { locale: fromCookie, source: 'cookie' };
	}

	if (acceptLanguage !== undefined) {
		const fromHeader = detectFromAcceptLanguage(acceptLanguage);
		if (fromHeader) return { locale: fromHeader, source: 'accept-language' };
	}

	return { locale: DEFAULT_LOCALE, source: 'default' };
}
