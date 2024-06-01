import type { RequestEvent } from '@sveltejs/kit';
import type { GenerationData } from '$lib/types';
import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { europeanCountries } from '$lib/utils/countries';

export async function GET(event: RequestEvent): Promise<Response> {
    try {
        const countryName = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countryCodeMap: { [key: string]: string } = {};

        // Build a mapping of country names to codes
        europeanCountries.forEach(([name, code]) => {
            countryCodeMap[name] = code;
        });

        const countryCode = countryCodeMap[countryName];

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
        const queryParams = [countryCode];

        const queryResult = await client.query<GenerationData>(generationQuery, queryParams);

        if (queryResult.rows.length < 2) {
            return json({ error: 'Not enough data available' }, { status: 404 });
        }

        const currentData = queryResult.rows[0];
        const previousData = queryResult.rows[1];

        // Remove specified keys
        const keysToRemove = ['renewables', 'nonrenewables', 'total'];
        keysToRemove.forEach(key => {
            delete currentData[key];
            delete previousData[key];
        });

        // Remove keys with zero values
        for (const key in currentData) {
            if (currentData[key] === 0) {
                delete currentData[key];
            }
        }

        for (const key in previousData) {
            if (previousData[key] === 0) {
                delete previousData[key];
            }
        }

        // Calculate the differences
        const percentageDifferences: { [key: string]: number } = {};
        for (const key in currentData) {
            if (currentData.hasOwnProperty(key) && previousData.hasOwnProperty(key)) {
                const previousValue = previousData[key];
                const currentValue = currentData[key];
                if (previousValue !== 0) {
                    const difference = ((currentValue - previousValue) / previousValue) * 100;
                    percentageDifferences[key] = difference;
                }
            }
        }

        // Remove keys: index and country_code from percentageDifferences
        delete percentageDifferences['index'];
        delete percentageDifferences['country_code'];

        const responseBody = JSON.stringify(percentageDifferences);
        return new Response(responseBody, {
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
