import type { RequestEvent } from '@sveltejs/kit';
import type { GenerationData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { europeanCountries } from '$lib/utils/countries';

export async function GET(event: RequestEvent): Promise<Response> {
	try {
		const country = String(event.url.searchParams.get('country') ?? 'Belgium');
		const countryCodes: { [key: string]: string } = {};

		europeanCountries.forEach(([name, code]) => {
			countryCodes[name] = code;
		});

		const countryCode = countryCodes[country];

		if (!countryCode) {
			return json({ error: 'Invalid country name' }, { status: 400 });
		}

		const query = `
            SELECT * FROM generation
            WHERE country_code = $1
            ORDER BY index DESC
            LIMIT 3
        `;
		const values = [countryCode];

		const result = await client.query<GenerationData>(query, values);
	
		if (result.rows.length === 0) {
			return json({ error: 'No data found for the specified country' }, { status: 404 });
		}
		let generationData;
		
		if (country === 'Germany') {
			generationData = result.rows[1];
		} else {
			generationData = result.rows[0];
		}


		const keysToDelete = ['renewables', 'nonrenewables', 'total'];

		keysToDelete.forEach((key) => {
			delete generationData[key];
		});

		for (const key in generationData) {
			if (generationData[key] === 0) {
				delete generationData[key];
			}
		}

		event.setHeaders({
			'cache-control': 'max-age=60'
		});

		return new Response(JSON.stringify(generationData), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching generation data:', error);
		return json({ error: 'An error occurred while fetching the generation data' }, { status: 500 });
	}
}
