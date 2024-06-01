import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { european_countries } from '$lib/utils/countries';
export async function GET(event) {
    try {

        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countries_link: { [key: string]: string } = {};
        european_countries.forEach(([name, code]) => {
            countries_link[name] = code;
        });
        const country_code = countries_link[country as keyof typeof countries_link];


        const result = await client.query(
            `select * from  "emissions" where country_code='${country_code}' ORDER By index DESC LIMIT 1`
        );


        const keysToDelete = ['Total_CEI', 'Carbon_Intensity_CEI'];

        // Loop through the keys and delete them from the object
        keysToDelete.forEach((key) => {
            if (result.rows[0].hasOwnProperty(key)) {
                delete result.rows[0][key];
            }
        });

        for (const key in result.rows[0]) {
            if (result.rows[0].hasOwnProperty(key) && result.rows[0][key] === 0) {
                delete result.rows[0][key];
            }
        }
        event.setHeaders({
            'cache-control': 'max-age=60'
        });



        const data = result.rows[0];
        data.hydro1 = (data.Hydro_storage_CEI || 0) + (data.Hydro_CEI || 0) + (data.Hydro_res_CEI || 0);
        data.wind = (data.Wind_off_CEI || 0) + (data.Wind_on_CEI || 0);


        // Remove original keys
        delete data.hydro_storage;
        delete data.hydro_res;
        delete data.wind_off;
        delete data.wind_on;
        delete data.hydro;
        delete data.index;
        delete data.country_code;
        data.hydro = data.hydro1
        delete data.hydro1;

        let newObject = {
            biomass: data.Biomass_CEI,
            lignite: data.Lignite_CEI,
            gas: data.Gas_CEI,
            coal: data.Coal_CEI,
            oil: data.Oil_CEI,
            geothermal: data.Geothermal_CEI,
            hydro: data.hydro,
            nuclear: data.Nuclear_CEI,
            other: data.Other_CEI,
            other_renew: data.Other_renew_CEI,
            solar: data.Solar_CEI,
            waste: data.Waste_CEI,
            wind: data.wind,
        };

        const responseBody = JSON.stringify(newObject);
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
