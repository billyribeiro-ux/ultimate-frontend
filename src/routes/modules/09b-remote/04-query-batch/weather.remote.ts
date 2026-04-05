import * as v from 'valibot';
import { query } from '$app/server';

export interface Weather {
	readonly cityId: string;
	readonly city: string;
	readonly tempC: number;
	readonly condition: 'sun' | 'rain' | 'snow' | 'cloud' | 'unknown';
}

// In-memory "database". Replace with real storage in production.
const db: Record<string, Weather> = {
	lon: { cityId: 'lon', city: 'London', tempC: 11, condition: 'rain' },
	nyc: { cityId: 'nyc', city: 'New York', tempC: 4, condition: 'snow' },
	tyo: { cityId: 'tyo', city: 'Tokyo', tempC: 18, condition: 'sun' },
	syd: { cityId: 'syd', city: 'Sydney', tempC: 25, condition: 'sun' },
	par: { cityId: 'par', city: 'Paris', tempC: 9, condition: 'cloud' },
	sao: { cityId: 'sao', city: 'São Paulo', tempC: 22, condition: 'cloud' }
};

export const listCities = query(async (): Promise<string[]> => {
	return Object.keys(db);
});

export const getWeather = query.batch(v.string(), async (cityIds): Promise<(id: string, idx: number) => Weather> => {
	// One call, many answers.
	const lookup = new Map<string, Weather>();
	for (const id of cityIds) {
		const row = db[id];
		if (row) lookup.set(id, row);
	}

	return (cityId, _index) =>
		lookup.get(cityId) ?? {
			cityId,
			city: cityId,
			tempC: Number.NaN,
			condition: 'unknown'
		};
});
