import type { RequestEvent } from '@sveltejs/kit';
import type { ForecastData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { addHours, format, subHours } from 'date-fns';
import { europeanCountries } from '$lib/utils/countries';

export async function GET(event: RequestEvent): Promise<Response> {
    try {
        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countryCodes: { [key: string]: string } = {};

        // Build a mapping of country names to codes
        europeanCountries.forEach(([name, code]) => {
            countryCodes[name] = code;
        });

        const countryCode = countryCodes[country];

        // Validate the country code
        if (!countryCode) {
            return json({ error: 'Invalid country name' }, { status: 400 });
        }

        const twentyFourHoursAgo = subHours(new Date(), 24);
        const twentyFourHoursAhead = addHours(new Date(), 48);
        const formattedDateAgo = format(twentyFourHoursAgo, 'yyyy-MM-dd HH:mm:ss');
        const formattedDateAhead = format(twentyFourHoursAhead, 'yyyy-MM-dd HH:mm:ss');

        // Use parameterized queries to prevent SQL injection
        const query = `
            SELECT time, "Cei_prediction"
            FROM "forecast_data"
            WHERE country_code = $1 AND time >= $2 AND time <= $3
            ORDER BY time ASC
        `;
        const values = [countryCode, formattedDateAgo, formattedDateAhead];

        const result = await client.query<ForecastData>(query, values);

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
        console.error('Error fetching forecast data:', error);
        return json({ error: 'An error occurred while fetching the forecast data' }, { status: 500 });
    }
}
