// Lesson 9A.4 — universal load that calls the public Open-Meteo API.
// The enhanced fetch is destructured from the event. On the initial render
// this runs on the server and the JSON response is inlined into the HTML.

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

interface Forecast {
	latitude: number;
	longitude: number;
	current: {
		time: string;
		temperature_2m: number;
	};
	current_units: {
		temperature_2m: string;
	};
}

export const load: PageLoad = async ({ fetch }): Promise<{ city: string; forecast: Forecast }> => {
	// Berlin coordinates. Open-Meteo requires no API key.
	const url =
		'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m';

	const response = await fetch(url);
	if (!response.ok) {
		throw error(response.status, 'Failed to load forecast from Open-Meteo');
	}

	const forecast: Forecast = await response.json();
	return { city: 'Berlin', forecast };
};
