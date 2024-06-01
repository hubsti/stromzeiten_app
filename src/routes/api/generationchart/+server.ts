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
            `select * from generation where country_code='${country_code}' ORDER By index DESC LIMIT 1`
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

        for (const key in result.rows[0]) {
            if (result.rows[0].hasOwnProperty(key) && result.rows[0][key] === 0) {
                delete result.rows[0][key];
            }
        }

        //console.log("Pirchart",jsonData)
        // Sum up hydro and wind values
        const data = result.rows[0];
        data.hydro1 = (data.hydro || 0) + (data.hydro_storage || 0) + (data.hydro_res || 0);
        data.wind = (data.wind_off || 0) + (data.wind_on || 0);

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
            biomass: data.biomass,
            lignite: data.lignite,
            gas: data.gas,
            coal: data.coal,
            oil: data.oil,
            geothermal: data.geothermal,
            hydro: data.hydro,
            nuclear: data.nuclear,
            other: data.other,
            other_renew: data.other_renew,
            solar: data.solar,
            waste: data.waste,
            wind: data.wind,
        };

        const responseBody = JSON.stringify(newObject);
        const response = new Response(responseBody, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //console.log("API",response);
        return response;
    } catch (error) {
        return json(error);
    }
}
