import type { RequestEvent } from '@sveltejs/kit';
import type { GenerationData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { europeanCountries } from '$lib/utils/countries';
import { format, subHours } from 'date-fns';

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

        const thirtyEightHoursAgo = subHours(new Date(), 38);
        const formattedDate = format(thirtyEightHoursAgo, 'yyyy-MM-dd HH:mm:ss');

        const query = `
            SELECT * FROM generation 
            WHERE country_code = $1 AND index >= $2 
            ORDER BY index DESC
        `;
        const values = [countryCode, formattedDate];

        const generationQueryResult = await client.query<GenerationData>(query, values);

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        const keysToRemove: (keyof GenerationData)[] = ['renewables', 'nonrenewables', 'total', 'country_code'];

        generationQueryResult.rows.forEach((row) => {
            keysToRemove.forEach((key) => {
                delete row[key];
            });
        });

        return new Response(JSON.stringify(generationQueryResult.rows), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(error);
        return json({ error: 'An error occurred while fetching the generation data' }, { status: 500 });
    }
}