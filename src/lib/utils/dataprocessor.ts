import { DateTime } from 'luxon';
interface ApiResponse {
    [key: string]: number;
}

interface ChartData {
    group: string;
    value: number;
}

interface ForecastApiResponse {
    time: string;
    Cei_prediction: number;
}

export interface LowestIntensityPeriod {
    start: string;
    end: string;
    averageIntensity: number;
}
interface GenerationApiResponse {
    gas: number;
    nuclear: number;
    other: number;
    waste: number;
    biomass: number;
    hydro_storage: number;
    hydro: number;
    solar: number;
    wind_off: number;
    wind_on: number;
    coal: number;
    lignite: number;
    oil: number;
}


export function formatDataForPieChart(dataPromise: Promise<any>): Promise<any> {
    return dataPromise.then((jsonData) => {
        let keys = Object.keys(jsonData);
        let values = Object.values(jsonData);

        let labels = keys.slice(1, -1); // remove first and last elements
        let valuesList = values.slice(1, -1); // remove first and last elements
        return { labels, valuesList };
    });
}


export function formatDataForAreaChart(dataPromise: Promise<any>): Promise<any> {
    return dataPromise.then((jsonData) => {
        let labels = jsonData.map((item: { index: any; }) => DateTime.fromISO(item.index).toJSDate());
        let carbonIntensityValues = jsonData.map((item: { Carbon_Intensity_CEI: any; }) => item.Carbon_Intensity_CEI);
        return { labels, carbonIntensityValues };
    });
}


export function calculateEnergyPercentages(apiPromise: Promise<ApiResponse>): Promise<{ renewable: number, nonRenewable: number, nuclear: number }> {
    return apiPromise.then((jsonData) => {
        const data = jsonData;
        let entries = Object.entries(data);
        entries.shift(); // remove first entry
        entries.pop(); // remove last entry

        let formatteddata = Object.fromEntries(entries);

        const renewableSources: (keyof GenerationApiResponse)[] = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on"];
        const nonRenewableSources: (keyof GenerationApiResponse)[] = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources: (keyof GenerationApiResponse)[] = ["nuclear"];

        const totalEnergy = Object.values(formatteddata).reduce((a, b) => a + b, 0);


        const renewableEnergy = renewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nonRenewableEnergy = nonRenewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nuclearEnergy = nuclearSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);

        const renewablePercentage = Math.round((renewableEnergy / totalEnergy) * 100);
        const nonRenewablePercentage = Math.round((nonRenewableEnergy / totalEnergy) * 100);
        const nuclearPercentage = Math.round((nuclearEnergy / totalEnergy) * 100);


        
        return {
            renewable: renewablePercentage,
            nonRenewable: nonRenewablePercentage,
            nuclear: nuclearPercentage
        };
    });
}