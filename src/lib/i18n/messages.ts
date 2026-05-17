/**
 * Typed message system demonstrating compile-time-safe i18n keys.
 *
 * In production you would use Paraglide.js for tree-shaking and compile-time extraction.
 * This module demonstrates the typed-key pattern that Paraglide generates.
 */

import type { SupportedLocale } from './config.js';

/**
 * Message definitions — each key maps to a function that takes interpolation params
 * and returns the translated string.
 */
export interface Messages {
	greeting: (params: { name: string }) => string;
	itemCount: (params: { count: number }) => string;
	price: (params: { amount: number; currency: string }) => string;
	lastUpdated: (params: { date: Date }) => string;
	welcome: () => string;
	nav_home: () => string;
	nav_pricing: () => string;
	nav_about: () => string;
}

export type MessageKey = keyof Messages;

const en: Messages = {
	greeting: ({ name }) => `Hello, ${name}!`,
	itemCount: ({ count }) => {
		if (count === 0) return 'No items';
		if (count === 1) return '1 item';
		return `${count} items`;
	},
	price: ({ amount, currency }) =>
		new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount),
	lastUpdated: ({ date }) =>
		`Last updated ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)}`,
	welcome: () => 'Welcome to our platform',
	nav_home: () => 'Home',
	nav_pricing: () => 'Pricing',
	nav_about: () => 'About'
};

const ptBR: Messages = {
	greeting: ({ name }) => `Ola, ${name}!`,
	itemCount: ({ count }) => {
		if (count === 0) return 'Nenhum item';
		if (count === 1) return '1 item';
		return `${count} itens`;
	},
	price: ({ amount, currency }) =>
		new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount),
	lastUpdated: ({ date }) =>
		`Atualizado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)}`,
	welcome: () => 'Bem-vindo a nossa plataforma',
	nav_home: () => 'Inicio',
	nav_pricing: () => 'Precos',
	nav_about: () => 'Sobre'
};

const ar: Messages = {
	greeting: ({ name }) => `مرحبا، ${name}!`,
	itemCount: ({ count }) => {
		if (count === 0) return 'لا عناصر';
		if (count === 1) return 'عنصر واحد';
		if (count === 2) return 'عنصران';
		if (count >= 3 && count <= 10) return `${count} عناصر`;
		return `${count} عنصرا`;
	},
	price: ({ amount, currency }) =>
		new Intl.NumberFormat('ar', { style: 'currency', currency }).format(amount),
	lastUpdated: ({ date }) =>
		`اخر تحديث ${new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(date)}`,
	welcome: () => 'مرحبا بكم في منصتنا',
	nav_home: () => 'الرئيسية',
	nav_pricing: () => 'الاسعار',
	nav_about: () => 'حول'
};

const messagesByLocale: Record<SupportedLocale, Messages> = {
	en,
	'pt-BR': ptBR,
	ar
};

/**
 * Get the messages object for a locale.
 * In production, Paraglide.js generates typed `m.greeting()` calls that tree-shake
 * per locale at build time. This is the runtime equivalent for demonstration.
 */
export function m(locale: SupportedLocale): Messages {
	return messagesByLocale[locale];
}
