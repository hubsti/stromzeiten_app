
export interface AvgEmissionsByCountry {
    country_code: string;
    avg_emission: number;
}

export interface AvgEmissionData {
    average_cei: number;
}

export interface EmissionData {
    Total_CEI?: number;
    Carbon_Intensity_CEI?: number;
    Biomass_CEI?: number;
    Lignite_CEI?: number;
    Gas_CEI?: number;
    Coal_CEI?: number;
    Oil_CEI?: number;
    Geothermal_CEI?: number;
    Hydro_storage_CEI?: number;
    Hydro_CEI?: number;
    Hydro_res_CEI?: number;
    Nuclear_CEI?: number;
    Other_CEI?: number;
    Other_renew_CEI?: number;
    Solar_CEI?: number;
    Waste_CEI?: number;
    Wind_off_CEI?: number;
    Wind_on_CEI?: number;
    index: string;
    country_code: string;
    [key: string]: any;
}

export interface GenerationData {
    renewables?: number;
    nonrenewables?: number;
    total?: number;
    biomass?: number;
    lignite?: number;
    gas?: number;
    coal?: number;
    oil?: number;
    geothermal?: number;
    hydro?: number;
    hydro_storage?: number;
    hydro_res?: number;
    nuclear?: number;
    other?: number;
    other_renew?: number;
    solar?: number;
    waste?: number;
    wind?: number;
    wind_off?: number;
    wind_on?: number;
    index: string;
    country_code: string;
    [key: string]: any;
}

export interface IntensityData {
    index: string;
    Carbon_Intensity_CEI: number;
}

export interface ForecastData {
    time: string;
    Cei_prediction: number;
}

