import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { europeanCountries } from '$lib/utils/countries';
import type { AvgEmissionsByCountry } from '$lib/types';
export async function GET(event) {
    try {
        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countryCodes: { [key: string]: string } = {};

        europeanCountries.forEach(([name, code]) => {
            countryCodes[name] = code;
        });

        const countryCode = countryCodes[country];

        const query = `
            SELECT * FROM avg_emissions_by_country3 
            WHERE country_code = $1
        `;
        const values = [countryCode];

        const result = await client.query<AvgEmissionsByCountry>(query, values);

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        if (result.rows.length === 0) {
            return json({ error: 'No data found for the specified country' }, { status: 404 });
        }

        const responseBody = JSON.stringify(result.rows[0]);

        return new Response(responseBody, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching average emissions by country:', error);
        return json({ error: 'An error occurred while fetching the average emissions data' }, { status: 500 });
    }
}
