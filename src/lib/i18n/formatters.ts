/**
 * Locale-aware formatters wrapping Intl APIs.
 * Provides typed, reusable formatting functions for dates, numbers, and relative time.
 */

import type { SupportedLocale } from './config.js';

export interface Formatter {
	date: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
	number: (value: number, options?: Intl.NumberFormatOptions) => string;
	currency: (value: number, currency: string) => string;
	percent: (value: number) => string;
	relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
	list: (items: string[], options?: Intl.ListFormatOptions) => string;
}

/**
 * Creates a locale-bound formatter object.
 * All methods use the Intl APIs internally and cache nothing —
 * browsers cache Intl constructors per locale internally.
 */
export function createFormatter(locale: SupportedLocale): Formatter {
	return {
		date(value: Date, options?: Intl.DateTimeFormatOptions): string {
			return new Intl.DateTimeFormat(locale, options).format(value);
		},

		number(value: number, options?: Intl.NumberFormatOptions): string {
			return new Intl.NumberFormat(locale, options).format(value);
		},

		currency(value: number, currency: string): string {
			return new Intl.NumberFormat(locale, {
				style: 'currency',
				currency
			}).format(value);
		},

		percent(value: number): string {
			return new Intl.NumberFormat(locale, {
				style: 'percent',
				minimumFractionDigits: 0,
				maximumFractionDigits: 1
			}).format(value);
		},

		relativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
			return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
		},

		list(items: string[], options?: Intl.ListFormatOptions): string {
			return new Intl.ListFormat(locale, options).format(items);
		}
	};
}
