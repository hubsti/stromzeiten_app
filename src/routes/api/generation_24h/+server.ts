import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { european_countries } from '$lib/utils/countries';
import { addHours, format, subHours } from 'date-fns';
export async function GET(event) {
    try {

        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countries_link: { [key: string]: string } = {};
        european_countries.forEach(([name, code]) => {
            countries_link[name] = code;
        });
        const country_code = countries_link[country as keyof typeof countries_link];

        const twentyFourHoursAgo = subHours(new Date(), 38);
        const formattedDate = format(twentyFourHoursAgo, 'yyyy-MM-dd HH:mm:ss');
        const result = await client.query(
            `select * from generation where country_code='${country_code}' AND index >= '${formattedDate}' ORDER By index DESC`
        );

        event.setHeaders({
            'cache-control': 'max-age=60'
        });

        const keysToDelete = ['renewables', 'nonrenewables', 'total', 'country_code'];

        // Loop through the keys and delete them from the object
        result.rows.forEach(obj => {
            keysToDelete.forEach(key => {
                delete obj[key];
            });
        });

        const responseBody = JSON.stringify(result.rows);
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
