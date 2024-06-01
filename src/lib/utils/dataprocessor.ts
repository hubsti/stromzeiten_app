import { DateTime } from 'luxon';
import type { GenerationData } from '$lib/types';
interface ApiResponse {
    [key: string]: number;
}

export function formatDataForPieChart(dataPromise: Promise<GenerationData>): Promise<{ labels: string[], valuesList: number[] }> {
    return dataPromise.then((data) => {
        const labels = Object.keys(data).filter(key => data[key] !== undefined);
        const valuesList = labels.map(key => parseFloat(data[key].toFixed(2)));

        return { labels, valuesList };
    });
}

export function formatDataForAreaChartGeneration(dataPromise: Promise<GenerationData[]>): Promise<{ labels: string[], valuesBySource: Record<string, number[]> }> {
    return dataPromise.then((generationData) => {
        const labels = generationData.map(item => item.index);
        const valuesBySource = generationData.reduce((acc: Record<string, number[]>, item) => {
            const itemData = { ...item };
            itemData['wind'] = (item['wind_on'] || 0) + (item['wind_off'] || 0);
            itemData['hydro'] = (item['hydro'] || 0) + (item['hydro_res'] || 0) + (item['hydro_storage'] || 0);
            delete itemData['wind_on'];
            delete itemData['wind_off'];
            delete itemData['hydro_res'];
            delete itemData['hydro_storage'];

            Object.keys(itemData).forEach(key => {
                if (key !== 'index' && itemData[key] !== 0) {
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(itemData[key]);
                }
            });
            return acc;
        }, {});
        return { labels, valuesBySource };
    });
}



export function formatDataForAreaChart(
    carbonIntensityDataPromise: Promise<GenerationData[]>,
    forecastDataPromise: Promise<{ time: string, Cei_prediction: number }[]>,
    averageDataPromise: Promise<{ average_cei: number }>
): Promise<{ sortedLabels: Date[], carbonIntensityValues: number[], predictedCarbonIntensityValues: number[], averageCarbonIntensity: number }> {
    return Promise.all([carbonIntensityDataPromise, forecastDataPromise, averageDataPromise]).then(([carbonIntensityData, forecastData, averageData]) => {
        const labels: string[] = [];
        const carbonIntensityValues: number[] = [];
        const predictedCarbonIntensityValues: number[] = [];

        const carbonIntensityMap = new Map(carbonIntensityData.map(item => [item.index, item.Carbon_Intensity_CEI]));

        carbonIntensityData.forEach(item => {
            labels.push(item.index);
            carbonIntensityValues.push(item.Carbon_Intensity_CEI);
        });

        forecastData.forEach(item => {
            if (!carbonIntensityMap.has(item.time)) {
                labels.push(item.time);
                predictedCarbonIntensityValues.push(item.Cei_prediction);
            }
        });

        labels.sort((a, b) => DateTime.fromISO(a).toJSDate().getTime() - DateTime.fromISO(b).toJSDate().getTime());

        if (predictedCarbonIntensityValues.length > 0) {
            predictedCarbonIntensityValues.unshift(carbonIntensityValues[carbonIntensityValues.length - 1]);
        }

        while (predictedCarbonIntensityValues.length < labels.length) {
            predictedCarbonIntensityValues.unshift(NaN);
        }

        const sortedLabels = labels.map(label => DateTime.fromISO(label).toJSDate());
        const averageCarbonIntensity = averageData.average_cei;

        return { sortedLabels, carbonIntensityValues, predictedCarbonIntensityValues, averageCarbonIntensity };
    });
}

export function calculateEnergyPercentages(apiPromise: Promise<ApiResponse>) {
    return apiPromise.then((jsonData) => {
        const data = jsonData;
        let entries = Object.entries(data);
        entries.shift();
        entries.pop();

        let formatteddata = Object.fromEntries(entries);

        const renewableSources = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on", "other_renew"];
        const nonRenewableSources = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources = ["nuclear"];

        const totalEnergy = Object.values(formatteddata).reduce((a, b) => a + b, 0);


        const renewableEnergy = renewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nonRenewableEnergy = nonRenewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nuclearEnergy = nuclearSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);

        const renewablePercentage = Math.round((renewableEnergy / totalEnergy) * 100);
        const nonRenewablePercentage = Math.round((nonRenewableEnergy / totalEnergy) * 100);
        const nuclearPercentage = Math.round((nuclearEnergy / totalEnergy) * 100);

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

        const renewableSources = ["biomass", "hydro_storage", "hydro", "solar", "wind_off", "wind_on", "other_renew"];
        const nonRenewableSources = ["gas", "other", "waste", "coal", "lignite", "oil"];
        const nuclearSources = ["nuclear"];

        const renewableEnergy = renewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nonRenewableEnergy = nonRenewableSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);
        const nuclearEnergy = nuclearSources.reduce((total, source) => total + (formatteddata[source] || 0), 0);


        return {
            renewable: renewableEnergy,
            nonRenewable: nonRenewableEnergy,
            nuclear: nuclearEnergy
        };
    });


}