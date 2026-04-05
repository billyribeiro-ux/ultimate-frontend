import adapter from '@sveltejs/adapter-auto';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Rune mode everywhere except node_modules (Svelte 5 default going forward).
		runes: ({ filename }) => {
			const relativePath = relative(import.meta.dirname, filename);
			const pathSegments = relativePath.toLowerCase().split(sep);
			const isExternalLibrary = pathSegments.includes('node_modules');
			return isExternalLibrary ? undefined : true;
		}
	},
	kit: {
		adapter: adapter(),
		// April 2026 syntax: opt into SvelteKit's remote functions (query / form / command).
		// Taught in Module 9B.
		experimental: {
			remoteFunctions: true
		},
		alias: {
			$lessons: 'lessons'
		}
	}
};

export default config;
