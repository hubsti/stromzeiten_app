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
export interface GenerationApiResponse {
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



export function formatDataForAreaChart(dataPromise: Promise<any>, dataPromise2: Promise<any>, dataPromise3: Promise<any>): Promise<any> {
    return Promise.all([dataPromise, dataPromise2, dataPromise3]).then(([jsonData, jsonData2, jsonData3]) => {

        let labels: string[] = [];
        let ceiValues: number[] = [];
        let ceiPredictionValues: number[] = [];

        const ceiMap = new Map(jsonData.map((item: { index: any; Carbon_Intensity_CEI: any; }) => [item.index, item.Carbon_Intensity_CEI]));

        jsonData.forEach((item: { index: string; Carbon_Intensity_CEI: number; }) => {
            labels.push(item.index);
            ceiValues.push(item.Carbon_Intensity_CEI);
        });

        jsonData2.forEach((item: { time: string; Cei_prediction: number; }) => {
            if (!ceiMap.has(item.time)) {
                labels.push(item.time);
                ceiPredictionValues.push(item.Cei_prediction);
            }
        });

        // Sort labels to ensure they are in chronological order
        labels.sort((a, b) => DateTime.fromISO(a).toJSDate().getTime() - DateTime.fromISO(b).toJSDate().getTime());

        // Set the last value of ceiValues to be the same as the first value of ceiPredictionValues
        if (ceiPredictionValues.length > 0) {
            ceiPredictionValues.unshift(ceiValues[ceiValues.length - 1]);
        }

        // Ensure ceiPredictionValues is the same length as labels
        while (ceiPredictionValues.length < labels.length) {
            ceiPredictionValues.unshift(NaN);
        }

        const labels_sorted = labels.map(label => DateTime.fromISO(label).toJSDate());

        let avg = jsonData3.average_cei;

        return { labels_sorted, ceiValues, ceiPredictionValues, avg };
    });
}



export function calculateEnergyPercentages(apiPromise: Promise<ApiResponse>): Promise<{ renewable: number, nonRenewable: number, nuclear: number }> {
    // @ts-ignore
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

        //console.log(renewablePercentage, nonRenewablePercentage, nuclearPercentage);

        return {
            renewable: renewablePercentage.toFixed(0),
            nonRenewable: nonRenewablePercentage.toFixed(0),
            nuclear: nuclearPercentage.toFixed(0),
            renewableabs: renewableEnergy.toFixed(0),
            nonRenewableabs: nonRenewableEnergy.toFixed(0),
            nuclearabs: nuclearEnergy.toFixed(0)
        };
    });


}

export function calculateEnergyDifferences(apiPromise: Promise<ApiResponse>): Promise<{ renewable: number, nonRenewable: number, nuclear: number }> {
    return apiPromise.then((jsonData) => {
        const data = jsonData;
        let entries = Object.entries(data);

        let formatteddata = Object.fromEntries(entries);

        const renewableSources: (keyof GenerationApiResponse)[] = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on"];
        const nonRenewableSources: (keyof GenerationApiResponse)[] = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources: (keyof GenerationApiResponse)[] = ["nuclear"];

        const renewableEnergy = renewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nonRenewableEnergy = nonRenewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nuclearEnergy = nuclearSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);

        //console.log(renewableEnergy, nonRenewableEnergy, nuclearEnergy);
        return {
            renewable: renewableEnergy,
            nonRenewable: nonRenewableEnergy,
            nuclear: nuclearEnergy
        };
    });


}