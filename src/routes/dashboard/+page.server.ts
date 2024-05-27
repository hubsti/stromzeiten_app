import { validateUser, type User } from "$lib/types";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {
    const newCountry = event.url.searchParams.get("country")
    if (newCountry) {
        event.cookies.set("country", newCountry, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });
    }
    const cookieCountry = event.cookies.get("country")

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

    const generation = async () => {
        const response = await event.fetch(`/api/generation?country=${new_country}`)
        
        return response
    }

    const carbon_intensity = async () => {
        const response = await event.fetch(`/api/CEI?country=${new_country}`)
        return response
    }
    const dashboard = async () => {
        const response = await event.fetch(`/api/dashboard?country=${new_country}`)
        return response
    }
    const generation_diff = async () => {
        const response = await event.fetch(`/api/generation2?country=${new_country}`)
        return response
    }

    const averge_cei = async () => {
        const response = await event.fetch(`/api/average_cei?country=${new_country}`)
        return response
    }
    const forecast = async () => {
        const response = await event.fetch(`/api/forecast?country=${new_country}`)
        return response
    }
    const emissions = async () => {
        const response = await event.fetch(`/api/emissions?country=${new_country}`)
        return response
    }
    const generation_24h = async () => {
        const response = await event.fetch(`/api/generation_24h?country=${new_country}`)
        return response
    }
    return {
        country: new_country,
        streamed: {
            generation: generation().then(d => d.json()).catch((error) => console.log(error)),
            carbon_intensity: carbon_intensity().then(d => d.json()).catch((error) => console.log(error)),
            dashboard: dashboard().then(d => d.json()).catch((error) => console.log(error)),
            generation_diff: generation_diff().then(d => d.json()).catch((error) => console.log(error)),
            averge_cei: averge_cei().then(d => d.json()).catch((error) => console.log(error)),
            forecast: forecast().then(d => d.json()).catch((error) => console.log(error)),
            emissions: emissions().then(d => d.json()).catch((error) => console.log(error)),
            generation_24h: generation_24h().then(d => d.json()).catch((error) => console.log(error)),
        },
    }
}