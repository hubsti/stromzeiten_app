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

        if (queryResult.rows.length === 0) {
            return json({ error: 'No data found for the specified country' }, { status: 404 });
        }


        let generationData;

        if (countryName === 'Germany') {
            generationData = queryResult.rows[1];
        } else {
            generationData = queryResult.rows[0];
        }

        // Remove specified keys
        const keysToRemove = ['renewables', 'nonrenewables', 'total'];
        keysToRemove.forEach(key => delete generationData[key]);

        // Remove keys with zero values
        for (const key in generationData) {
            if (generationData[key] === 0) {
                delete generationData[key];
            }
        }

        // Combine specific keys for hydro and wind
        generationData.hydro = (generationData.hydro || 0) + (generationData.hydro_storage || 0) + (generationData.hydro_res || 0);
        generationData.wind = (generationData.wind_off || 0) + (generationData.wind_on || 0);

        // Remove original keys for hydro and wind
        delete generationData.hydro_storage;
        delete generationData.hydro_res;
        delete generationData.wind_off;
        delete generationData.wind_on;

        // Create new object with the required structure
        const structuredGenerationData = {
            biomass: generationData.biomass,
            lignite: generationData.lignite,
            gas: generationData.gas,
            coal: generationData.coal,
            oil: generationData.oil,
            geothermal: generationData.geothermal,
            hydro: generationData.hydro,
            nuclear: generationData.nuclear,
            other: generationData.other,
            other_renew: generationData.other_renew,
            solar: generationData.solar,
            waste: generationData.waste,
            wind: generationData.wind,
        };

        const responseBody = JSON.stringify(structuredGenerationData);
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