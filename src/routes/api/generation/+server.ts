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
			`select * from generation where country_code='${country_code}' ORDER By index ASC LIMIT 1`
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

		const responseBody = JSON.stringify(result.rows[0]);
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
