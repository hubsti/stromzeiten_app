import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async (event) => {
    const queryCountry = event.url.searchParams.get("country");
    const cookieCountry = event.cookies.get("country");

    // Determine the country to use
    const selectedCountry = queryCountry || cookieCountry || "Belgium";

    // Set the country cookie if a new country is provided
    if (queryCountry) {
        event.cookies.set("country", queryCountry, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
    }

    // Fetch data from APIs
    const fetchData = async (endpoint: string) => {
        try {
            const response = await event.fetch(endpoint);
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    };

    return {
        selectedCountry,
        streamed: {
            generationData: fetchData(`/api/current-generation?country=${selectedCountry}`),
            carbonIntensityData: fetchData(`/api/carbon-intensity?country=${selectedCountry}`),
            dashboardData: fetchData(`/api/dashboard?country=${selectedCountry}`),
            generationDifferenceData: fetchData(`/api/difference-generation?country=${selectedCountry}`),
            averageCeiData: fetchData(`/api/average-carbon-intensity?country=${selectedCountry}`),
            forecastData: fetchData(`/api/emissions-forecast?country=${selectedCountry}`),
            emissionsData: fetchData(`/api/emissions?country=${selectedCountry}`),
            generation24hData: fetchData(`/api/24h-generation?country=${selectedCountry}`),
            generationChartData: fetchData(`/api/generation-pie-chart-data?country=${selectedCountry}`),
            emissionsPieChartData: fetchData(`/api/emissions-pie-chart-data?country=${selectedCountry}`),
        },
    };
};