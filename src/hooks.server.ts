import type { Handle } from "@sveltejs/kit";

export const handle: Handle = (async ({ event, resolve }) => {
    let country: string | null = null
    //console.log(event.url)
    const newCountry = event.url.searchParams.get('country')
    const cookieCountry = event.cookies.get('selected_country')
    //console.log("hook country:", newCountry)
    if (newCountry) {
        country = newCountry

    } else if (cookieCountry) {
        country = cookieCountry
    }

    return await resolve(event);
}) satisfies Handle