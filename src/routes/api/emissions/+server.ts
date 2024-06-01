import type { RequestEvent } from '@sveltejs/kit';
import type { EmissionData } from '$lib/types';
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

        // Validate the country code
        if (!countryCode) {
            return json({ error: 'Invalid country name' }, { status: 400 });
        }

        // Use parameterized queries to prevent SQL injection
        const query = `
            SELECT * FROM "emissions"
            WHERE country_code = $1
            ORDER BY index DESC
            LIMIT 1
        `;
        const values = [countryCode];

        const result = await client.query<EmissionData>(query, values);

        if (result.rows.length === 0) {
            return json({ error: 'No data found for the specified country' }, { status: 404 });
        }

        const emissionData = result.rows[0];

        const keysToDelete = ['Total_CEI', 'Carbon_Intensity_CEI'];

        // Remove specified keys from the object
        keysToDelete.forEach((key) => {
            delete emissionData[key];
        });

        // Remove keys with zero values
        for (const key in emissionData) {
            if (emissionData[key] === 0) {
                delete emissionData[key];
            }
        }

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        return new Response(JSON.stringify(emissionData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching emission data:', error);
        return json({ error: 'An error occurred while fetching the emission data' }, { status: 500 });
    }
}
