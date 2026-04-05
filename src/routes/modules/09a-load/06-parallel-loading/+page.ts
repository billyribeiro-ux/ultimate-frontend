// Lesson 9A.6 — parallel loading of three Open-Meteo forecasts via Promise.all.

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

interface CityForecast {
	name: string;
	forecast: Forecast;
}

interface City {
	name: string;
	lat: number;
	lon: number;
}

const cities: readonly City[] = [
	{ name: 'Berlin', lat: 52.52, lon: 13.41 },
	{ name: 'Lisbon', lat: 38.72, lon: -9.14 },
	{ name: 'Reykjavík', lat: 64.14, lon: -21.94 }
];

export const load: PageLoad = async ({ fetch }): Promise<{ cities: CityForecast[]; elapsedMs: number }> => {
	const start = performance.now();

	const forecasts = await Promise.all(
		cities.map(async (city): Promise<CityForecast> => {
			const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`;
			const response = await fetch(url);
			if (!response.ok) {
				throw error(response.status, `Failed to load forecast for ${city.name}`);
			}
			const forecast: Forecast = await response.json();
			return { name: city.name, forecast };
		})
	);

	const elapsedMs = performance.now() - start;
	return { cities: forecasts, elapsedMs };
};
