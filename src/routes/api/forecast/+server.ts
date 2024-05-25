import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { addHours, format, subHours } from 'date-fns';
import { european_countries } from '$lib/utils/countries';
export async function GET(event) {
    try {
        const country = String(event.url.searchParams.get('country') ?? 'Belgium');
        const countries_link: { [key: string]: string } = {};
        european_countries.forEach(([name, code]) => {
            countries_link[name] = code;
        });
        const country_code = countries_link[country as keyof typeof countries_link];
        const twentyFourHoursAgo = subHours(new Date(), 24);
        const twentyFourHoursAhead = addHours(new Date(), 24);
        const formattedDateAgo = format(twentyFourHoursAgo, 'yyyy-MM-dd HH:mm:ss');
        const formattedDateAhead = format(twentyFourHoursAhead, 'yyyy-MM-dd HH:mm:ss');
        const result = await client.query(
            `select time, "Cei_prediction" from "forecast_data" where country_code='${country_code}' AND time >= '${formattedDateAgo}' ORDER By time asc`
        );

        event.setHeaders({
            'cache-control': 'max-age=60'
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
