import type { RequestEvent } from '@sveltejs/kit';
import type { IntensityData, AvgEmissionData } from '$lib/types';
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

		const emissionsQuery = `
            SELECT index, "Carbon_Intensity_CEI", country_code
            FROM "emissions"
            WHERE country_code = $1
            ORDER BY index DESC
            LIMIT 2
        `;
		const avgEmissionsQuery = `
            SELECT average_cei
            FROM avg_emissions_by_country3
            WHERE country_code = $1
        `;
		const values = [countryCode];

		const emissionsResult = await client.query<IntensityData>(emissionsQuery, values);
		const avgEmissionsResult = await client.query<AvgEmissionData>(avgEmissionsQuery, values);

		if (emissionsResult.rows.length < 2) {
			return json({ error: 'Not enough data available' }, { status: 404 });
		}

		const average = avgEmissionsResult.rows[0].average_cei;
		const currentCEI = parseFloat(emissionsResult.rows[0].Carbon_Intensity_CEI.toFixed(0));
		const previousCEI = emissionsResult.rows[1].Carbon_Intensity_CEI;
		const difference = (((currentCEI - previousCEI) / previousCEI) * 100).toFixed(0);

		const time = new Date(emissionsResult.rows[0].index).toLocaleTimeString([], {
			hourCycle: 'h23',
			hour: '2-digit',
			minute: '2-digit'
		});

		emissionsResult.rows[0].Carbon_Intensity_CEI = currentCEI;
		emissionsResult.rows[0].index = time;

		event.setHeaders({
			'cache-control': 'max-age=60'
		});

		const responseBody = {
			time,
			Carbon_Intensity_CEI: currentCEI.toString(),
			country_code: countryCode,
			difference,
			average: average.toString()
		};

		return new Response(JSON.stringify(responseBody), {
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
