import client from '$lib/utils/db';
import { json } from '@sveltejs/kit';
import { european_countries } from '$lib/utils/dataprocessor';
function timeNow(i: { value: string }) {
	const d = new Date(),
		h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
		m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
	i.value = h + ':' + m;
}

export async function GET(event) {
	try {
		const country = String(event.url.searchParams.get('country') ?? 'Belgium');
		const countries_link: { [key: string]: string } = {
			Belgium: 'BE',
			Germany: 'DE',
			Poland: 'PL',
			France: 'FR',
			Portugal: 'PT'
		};
		european_countries.forEach(([name, code]) => {
			if (!countries_link[name]) {
				countries_link[name] = code;
			}
		});
		const country_code = countries_link[country as keyof typeof countries_link];
		const result = await client.query(
			`select index, "Carbon_Intensity_CEI", country_code from "emissions" where country_code='${country_code}' ORDER By index desc LIMIT 2`
		);
		const result2 = await client.query(
			`SELECT * FROM avg_emissions_by_country3 WHERE country_code='${country_code}'`
		);
		
		const average = result2.rows[0].average_cei
		console.log(average)
		const CEI = result.rows[0].Carbon_Intensity_CEI.toFixed(0);
		result.rows[0].Carbon_Intensity_CEI = CEI;
		const time = result.rows[0].index.toLocaleTimeString([], {
			hourCycle: 'h23',
			hour: '2-digit',
			minute: '2-digit'
		});
		result.rows[0].index = time;

		event.setHeaders({
			'cache-control': 'max-age=60'
		});


    const difference = (((result.rows[0].Carbon_Intensity_CEI - result.rows[1].Carbon_Intensity_CEI)/result.rows[1].Carbon_Intensity_CEI)*100).toFixed(0)
    const new_response = `{"time":"${time}", "Carbon_Intensity_CEI":"${CEI}","country_code":"${country_code}", "difference":"${difference}", "average":"${average}"}`

		const response = new Response(new_response, {
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
