import type { RequestEvent } from '@sveltejs/kit';
import type { GenerationData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
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

        // Use parameterized queries to prevent SQL injection
        const generationQuery = `
            SELECT * FROM generation
            WHERE country_code = $1
            ORDER BY index DESC
            LIMIT 2
        `;
        const values = [countryCode];

        const generationResult = await client.query<GenerationData>(generationQuery, values);

        if (generationResult.rows.length < 2) {
            return json({ error: 'Not enough data available' }, { status: 404 });
        }

        const keysToDelete = ['renewables', 'nonrenewables', 'total'];

        // Remove specified keys from the result rows
        generationResult.rows.forEach(row => {
            keysToDelete.forEach(key => delete row[key]);
            for (const key in row) {
                if (row[key] === 0) {
                    delete row[key];
                }
            }
        });

        const renewableSources: (keyof GenerationData)[] = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on"];
        const nonRenewableSources: (keyof GenerationData)[] = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources: (keyof GenerationData)[] = ["nuclear"];

        let oldValues = { renewable: 0, nonRenewable: 0, nuclear: 0 };
        let newValues = { renewable: 0, nonRenewable: 0, nuclear: 0 };

        renewableSources.forEach(source => {
            oldValues.renewable += generationResult.rows[1][source] || 0;
            newValues.renewable += generationResult.rows[0][source] || 0;
        });

        nonRenewableSources.forEach(source => {
            oldValues.nonRenewable += generationResult.rows[1][source] || 0;
            newValues.nonRenewable += generationResult.rows[0][source] || 0;
        });

        nuclearSources.forEach(source => {
            oldValues.nuclear += generationResult.rows[1][source] || 0;
            newValues.nuclear += generationResult.rows[0][source] || 0;
        });

        const percentageChanges = {
            renewable: isNaN(((newValues.renewable - oldValues.renewable) / oldValues.renewable) * 100) ? '0' : (((newValues.renewable - oldValues.renewable) / oldValues.renewable) * 100).toFixed(0),
            nonRenewable: isNaN(((newValues.nonRenewable - oldValues.nonRenewable) / oldValues.nonRenewable) * 100) ? '0' : (((newValues.nonRenewable - oldValues.nonRenewable) / oldValues.nonRenewable) * 100).toFixed(0),
            nuclear: isNaN(((newValues.nuclear - oldValues.nuclear) / oldValues.nuclear) * 100) ? '0' : (((newValues.nuclear - oldValues.nuclear) / oldValues.nuclear) * 100).toFixed(0)
        };

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        return new Response(JSON.stringify(percentageChanges), {
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
