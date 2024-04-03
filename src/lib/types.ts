
export type TrackingStrategy = 'DATA_IMPORT' | 'INPUT_VALUE' | 'API_DATA';

export interface Stock {
    id: Number,
    name: string,
    provider: Provider,
    provider_name: string,
    sector: string,
    region: string,
    stock_code: string,
    tracking_strategy: TrackingStrategy,
    users: number[], // list of visible users holding this stock
    currently_held: boolean,
};

export interface Provider {
    id: Number,
    name: string,
    csv_format: string,
    csv_format_obj: {[key: string]: number}
};

export interface Snapshot {
    stock: Stock,
    date: Date,
    user: User,

    units: string,
    price: string,
    cost: string,
    value: string,
    changeSinceLast: string,
    normalisedPerformance: string,
}

export interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    is_admin: boolean,
    client_options: string,
    access_permissions: string[] // TODO: type properly
}

