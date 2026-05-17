/**
 * i18n utilities for the Ultimate Frontend course.
 * Module 19 — typed message helpers, locale detection, and formatters.
 */

export { detectLocale, type LocaleSource } from './locale-detection.js';
export { createFormatter, type Formatter } from './formatters.js';
export { m, type MessageKey, type Messages } from './messages.js';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './config.js';
