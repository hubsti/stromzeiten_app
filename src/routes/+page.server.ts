import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {

    const newCountry = event.url.searchParams.get("country")
    if (newCountry) {
        event.cookies.set("country", newCountry, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });
    }
    const cookieCountry = event.cookies.get("selected_country")

    let new_country: string | null = null

    if (newCountry) {
        new_country = newCountry
    }
    else if (cookieCountry) {
        new_country = cookieCountry
    }
    else {
        new_country = "Belgium"
    }


    const dashboard = async () => {
        const response = await event.fetch(`/api/dashboard?country=${new_country}`)
        return response
    }

    const generation = async () => {
        const response = await event.fetch(`/api/generation?country=${new_country}`)
        return response
    }

    const CEI = async () => {
        const response = await event.fetch(`/api/CEI?country=${new_country}`)
        return response
    }

    const forecast = async () => {
        const response = await event.fetch(`/api/forecast?country=${new_country}`)
        return response
    }

    const average = async () => {
        const response = await event.fetch(`/api/average_cei?country=${new_country}`)
        return response
    }
    return {
        country: new_country,
        streamed: {
            dashboard: dashboard().then(d => d.json()).catch((error) => console.log(error)),
            generation: generation().then(d => d.json()).catch((error) => console.log(error)),
            CEI: CEI().then(d => d.json()).catch((error) => console.log(error)),
            forecast: forecast().then(d => d.json()).catch((error) => console.log(error)),
            average: average().then(d => d.json()).catch((error) => console.log(error))
        },
    }
}
export const actions: Actions = {
    setCountry: async ({ url, cookies }) => {
        const country = url.searchParams.get('country')
        const redirectTo = url.searchParams.get('redirectTo')

        if (country) {
            cookies.set('selected_country', country, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

        }

        throw redirect(303, `${redirectTo ?? '/dashboard'}?country=${country}`)



    },

	setTheme: async ({ url, cookies }) => {
        const theme = url.searchParams.get("theme");
        const redirectTo = url.searchParams.get("redirectTo");

        if (theme) {
            cookies.set("colortheme", theme, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
            });
        }

        throw redirect(303, redirectTo ?? "/");
    },

}