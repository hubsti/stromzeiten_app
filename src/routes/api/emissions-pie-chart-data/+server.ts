import type { RequestEvent } from '@sveltejs/kit';
import type { EmissionData } from '$lib/types';
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
        const emissionQuery = `
            SELECT * FROM "emissions"
            WHERE country_code = $1
            ORDER BY index DESC
            LIMIT 1
        `;
        const queryParams = [countryCode];

        const queryResult = await client.query<EmissionData>(emissionQuery, queryParams);

        if (queryResult.rows.length === 0) {
            return json({ error: 'No data found for the specified country' }, { status: 404 });
        }

        const emissionData = queryResult.rows[0];

        // Remove specified keys
        const keysToRemove = ['Total_CEI', 'Carbon_Intensity_CEI'];
        keysToRemove.forEach(key => delete emissionData[key]);

        // Remove keys with zero values
        for (const key in emissionData) {
            if (emissionData[key] === 0) {
                delete emissionData[key];
            }
        }

        // Combine specific keys
        emissionData.hydro = (emissionData.Hydro_storage_CEI || 0) + (emissionData.Hydro_CEI || 0) + (emissionData.Hydro_res_CEI || 0);
        emissionData.wind = (emissionData.Wind_off_CEI || 0) + (emissionData.Wind_on_CEI || 0);

        // Remove original keys


        delete emissionData.Hydro_storage_CEI;
        delete emissionData.Hydro_res_CEI;
        delete emissionData.Wind_off_CEI;
        delete emissionData.Wind_on_CEI;
        
        // Create new object with the required structure
        const structuredEmissionData = {
            biomass: emissionData.Biomass_CEI,
            lignite: emissionData.Lignite_CEI,
            gas: emissionData.Gas_CEI,
            coal: emissionData.Coal_CEI,
            oil: emissionData.Oil_CEI,
            geothermal: emissionData.Geothermal_CEI,
            hydro: emissionData.hydro,
            nuclear: emissionData.Nuclear_CEI,
            other: emissionData.Other_CEI,
            otherRenewable: emissionData.Other_renew_CEI,
            solar: emissionData.Solar_CEI,
            waste: emissionData.Waste_CEI,
            wind: emissionData.wind,
        };

        const responseBody = JSON.stringify(structuredEmissionData);
        return new Response(responseBody, {
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
