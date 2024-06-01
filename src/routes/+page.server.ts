import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


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