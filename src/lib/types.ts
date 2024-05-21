export type User = {
    id: number;
    age: number;
    height: number;
    weight: number;
    firstName: string;
    lastName: string;
};

export type Generation = {
    index: string;
    gas: number;
    nuclear: number;
    other: number;
    waste: number;
    biomass: number;
    hydro_storage: number;
    hydro: number;
    wind_off: number;
    wind_on: number;
    country_code: string;
};


/*
"index": "2024-01-13T16:00:00.000Z",
    "gas": 2374,
        "nuclear": 3980,
            "other": 443,
                "waste": 155,
                    "biomass": 49,
                        "hydro_storage": 93,
                            "hydro": 7,
                                "wind_off": 192,
                                    "wind_on": 322,
                                        "country_code": "BE"
}*/
export function validateUser(data: any): data is User {
    const idValid = typeof data.id === "number";
    const ageValid = typeof data.age === "number";
    const heightValid = typeof data.height === "number";
    const weightValid = typeof data.weight === "number";
    const firstNameValid = typeof data.firstName === "string";
    const lastNameValid = typeof data.lastName === "string";

    return (
        idValid &&
        ageValid &&
        heightValid &&
        weightValid &&
        firstNameValid &&
        lastNameValid
    );
}