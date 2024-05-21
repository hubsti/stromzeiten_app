import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { european_countries } from '$lib/utils/dataprocessor';
export async function GET(event) {
    try {
        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countries_link: { [key: string]: string } = {
            Belgium: 'BE',
            Germany: 'DE',
            Poland: 'PL',
            France: 'FR',
            Portugal: 'PT'
        };
        european_countries.forEach(([name, code]) => {
            if (!countries_link[name]) {
                countries_link[name] = code;
            }
        });
        const country_code = countries_link[country as keyof typeof countries_link];

        const result = await client.query(
            `SELECT * FROM avg_emissions_by_country3 WHERE country_code='${country_code}'`
        );

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        const responseBody = JSON.stringify(result.rows[0]);

        const response = new Response(responseBody, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        return json(error);
    }
}
