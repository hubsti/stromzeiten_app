import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { european_countries } from '$lib/utils/countries';
import type { GenerationApiResponse } from '$lib/utils/dataprocessor'; // Import the type GenerationApiResponse
// Import the type GenerationApiResponse
export async function GET(event) {
    try {

        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countries_link: { [key: string]: string } = {};
        european_countries.forEach(([name, code]) => {
            countries_link[name] = code;
        });
        const country_code = countries_link[country as keyof typeof countries_link];


        const result = await client.query(
            `select * from generation where country_code='${country_code}' ORDER By index DESC LIMIT 2`
        );

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        const keysToDelete = ['renewables', 'nonrenewables', 'total',];

        // Loop through the keys and delete them from the object
        keysToDelete.forEach((key) => {
            if (result.rows[0].hasOwnProperty(key)) {
                delete result.rows[0][key];
            }
        });

        keysToDelete.forEach((key) => {
            if (result.rows[1].hasOwnProperty(key)) {
                delete result.rows[1][key];
            }
        });

        for (const key in result.rows[0]) {
            if (result.rows[0].hasOwnProperty(key) && result.rows[0][key] === 0) {
                delete result.rows[0][key];
            }
        }

        for (const key in result.rows[1]) {
            if (result.rows[1].hasOwnProperty(key) && result.rows[1][key] === 0) {
                delete result.rows[1][key];
            }
        }

        const renewableSources: (keyof GenerationApiResponse)[] = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on"];
        const nonRenewableSources: (keyof GenerationApiResponse)[] = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources: (keyof GenerationApiResponse)[] = ["nuclear"];

        let oldValues = { renewable: 0, nonRenewable: 0, nuclear: 0 };
        let newValues = { renewable: 0, nonRenewable: 0, nuclear: 0 };

        for (const key in result.rows[0]) {
            if (result.rows[0].hasOwnProperty(key) && result.rows[1].hasOwnProperty(key)) {
                if (renewableSources.includes(key as keyof GenerationApiResponse)) { // Cast 'key' to 'keyof GenerationApiResponse'
                    oldValues.renewable += result.rows[1][key];
                    newValues.renewable += result.rows[0][key];
                } else if (nonRenewableSources.includes(key as keyof GenerationApiResponse)) { // Cast 'key' to 'keyof GenerationApiResponse'
                    oldValues.nonRenewable += result.rows[1][key];
                    newValues.nonRenewable += result.rows[0][key];
                } else if (nuclearSources.includes(key as keyof GenerationApiResponse)) { // Cast 'key' to 'keyof GenerationApiResponse'
                    oldValues.nuclear += result.rows[1][key];
                    newValues.nuclear += result.rows[0][key];
                }
            }
        }

        const percentageChanges = {
            renewable: isNaN((((newValues.renewable - oldValues.renewable) / oldValues.renewable) * 100)) ? 0 : (((newValues.renewable - oldValues.renewable) / oldValues.renewable) * 100).toFixed(0),
            nonRenewable: isNaN((((newValues.nonRenewable - oldValues.nonRenewable) / oldValues.nonRenewable) * 100)) ? 0 : (((newValues.nonRenewable - oldValues.nonRenewable) / oldValues.nonRenewable) * 100).toFixed(0),
            nuclear: isNaN((((newValues.nuclear - oldValues.nuclear) / oldValues.nuclear) * 100)) ? 0 : (((newValues.nuclear - oldValues.nuclear) / oldValues.nuclear) * 100).toFixed(0)
        };

        const responseBody = JSON.stringify(percentageChanges );
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
