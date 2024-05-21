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


export const european_countries = [
    ["Austria", "AT", "Vienna", "Europe/Brussels"],
    ["Belgium", "BE", "Brussels", "Europe/Brussels"],
    ["Bosnia and Herzegovina", "BA", "Sarajevo", "Europe/Belgrade"],
    ["Bulgaria", "BG", "Sofia", "Europe/Sofia"],
    ["Croatia", "HR", "Zagreb", "Europe/Belgrade"],
    ["Czech Republic", "CZ", "Prague", "Europe/Prague"],
    ["Denmark", "DK", "Copenhagen", "Europe/Copenhagen"], 
    ["Estonia", "EE", "Tallinn", "Europe/Tallinn"],
    ["Finland", "FI", "Helsinki", "Europe/Helsinki"],
    ["France", "FR", "Paris", "Europe/Paris"],
    ["Germany", "DE", "Berlin", "Europe/Berlin"], 
    ["Greece", "GR", "Athens", "Europe/Athens"],
    ["Hungary", "HU", "Budapest", "Europe/Budapest"],
    ["Ireland", "IE", "Dublin", "Europe/Dublin"], 
    ["Italy", "IT", "Rome", "Europe/Rome"], 
    ["Kosovo", "XK", "Pristina", "Europe/Belgrade"], 
    ["Latvia", "LV", "Riga", "Europe/Riga"],
    ["Lithuania", "LT", "Vilnius", "Europe/Vilnius"],
    ["Luxembourg", "LU", "Luxembourg", "Europe/Luxembourg"], 
    ["Moldova", "MD", "Chisinau", "Europe/Chisinau"], 
    ["Montenegro", "ME", "Podgorica", "Europe/Belgrade"],
    ["Netherlands", "NL", "Amsterdam", "Europe/Amsterdam"],
    ["North Macedonia", "MK", "Skopje", "Europe/Belgrade"],
    ["Norway", "NO", "Oslo", "Europe/Oslo"], 
    ["Poland", "PL", "Warsaw", "Europe/Warsaw"],
    ["Portugal", "PT", "Lisbon", "Europe/Lisbon"],
    ["Romania", "RO", "Bucharest", "Europe/Bucharest"],
    ["Serbia", "RS", "Belgrade", "Europe/Belgrade"],
    ["Slovakia", "SK", "Bratislava", "Europe/Bratislava"],
    ["Slovenia", "SI", "Ljubljana", "Europe/Ljubljana"],
    ["Spain", "ES", "Madrid", "Europe/Madrid"],
    ["Sweden", "SE", "Stockholm", "Europe/Stockholm"], 
    ["Switzerland", "CH", "Bern", "Europe/Zurich"],
];

export const countryFlags: { [key: string]: string } = {
    'Austria': '🇦🇹',
    'Belgium': '🇧🇪',
    'Bosnia and Herzegovina': '🇧🇦',
    'Bulgaria': '🇧🇬',
    'Croatia': '🇭🇷',
    'Czech Republic': '🇨🇿',
    'Denmark': '🇩🇰',
    'Estonia': '🇪🇪',
    'Finland': '🇫🇮',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Greece': '🇬🇷',
    'Hungary': '🇭🇺',
    'Ireland': '🇮🇪',
    'Italy': '🇮🇹',
    'Kosovo': '🇽🇰',
    'Latvia': '🇱🇻',
    'Lithuania': '🇱🇹',
    'Luxembourg': '🇱🇺',
    'Malta': '🇲🇹',
    'Moldova': '🇲🇩',
    'Montenegro': '🇲🇪',
    'Netherlands': '🇳🇱',
    'North Macedonia': '🇲🇰',
    'Norway': '🇳🇴',
    'Poland': '🇵🇱',
    'Portugal': '🇵🇹',
    'Romania': '🇷🇴',
    'San Marino': '🇸🇲',
    'Serbia': '🇷🇸',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Spain': '🇪🇸',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Turkey': '🇹🇷',
    'Ukraine': '🇺🇦',}


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
        let labels = jsonData.map((item: { index: any; }) => item.index);
        let carbonIntensityValues = jsonData.map((item: { Carbon_Intensity_CEI: any; }) => item.Carbon_Intensity_CEI);
        return { labels, carbonIntensityValues };
    });
}
