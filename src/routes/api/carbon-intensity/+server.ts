import type { RequestEvent } from '@sveltejs/kit';
import type { IntensityData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { subHours, format } from 'date-fns';
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

		const twentyFourHoursAgo = subHours(new Date(), 24);
		const formattedDate = format(twentyFourHoursAgo, 'yyyy-MM-dd HH:mm:ss');

		const query = `
            SELECT index, "Carbon_Intensity_CEI"
            FROM "emissions"
            WHERE country_code = $1 AND index >= $2
            ORDER BY index ASC
        `;
		const values = [countryCode, formattedDate];

		const result = await client.query<IntensityData>(query, values);

		if (country === 'Germany') {
			result.rows.pop();
		} 
		event.setHeaders({
			'cache-control': 'max-age=60'
		});

		return new Response(JSON.stringify(result.rows), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching emissions data:', error);
		return json({ error: 'An error occurred while fetching the emissions data' }, { status: 500 });
	}
}
