import type { ServerLoad } from '@sveltejs/kit';

// NOTE for students: in a real project you would import from $env:
//
//   import { PUBLIC_SITE_NAME } from '$env/static/public';
//   import { DATABASE_URL } from '$env/static/private';
//
// and add the values to a local .env file. For the course we hardcode
// safe defaults so the mini-build runs without a .env file and no secrets
// are committed to the repository.

const PUBLIC_SITE_NAME = 'Ultimate Frontend';
const DATABASE_URL = 'postgres://localhost:5432/notes_demo';

export const load: ServerLoad = async () => {
	return {
		publicSiteName: PUBLIC_SITE_NAME,
		// Never return the raw secret. Hash-like summary only.
		databaseHint: `postgres://…${DATABASE_URL.slice(-12)}`
	};
};
