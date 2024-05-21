import { validateUser, type User } from "$lib/types";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {

    const generation = async () => {
        const response = await event.fetch(`/api/generation?country=Belgium`)
        
        return response
    }

    const carbon_intensity = async () => {
        const response = await event.fetch(`/api/CEI?country=Belgium`)
        return response
    }
    const dashboard = async () => {
        const response = await event.fetch(`/api/dashboard?country=Belgium`)
        return response
    }
    return {
        streamed: {
            generation: generation().then(d => d.json()).catch((error) => console.log(error)),
            carbon_intensity: carbon_intensity().then(d => d.json()).catch((error) => console.log(error)),
            dashboard: dashboard().then(d => d.json()).catch((error) => console.log(error)),
        },
    }
}