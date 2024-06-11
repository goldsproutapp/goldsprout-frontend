export type TrackingStrategy = 'DATA_IMPORT' | 'INPUT_VALUE' | 'API_DATA';

export interface Stock {
  id: number;
  name: string;
  provider: Provider;
  provider_name: string;
  sector: string;
  region: string;
  stock_code: string;
  tracking_strategy: TrackingStrategy;
  needs_attention: boolean;
  users: number[]; // list of visible users holding this stock
  currently_held: boolean;
  annual_fee: number;
  total_fee: number; // including provider fee
}

export interface Provider {
  id: number;
  name: string;
  csv_format: string;
  csv_format_obj: { [key: string]: number };
  annual_fee: number;
}

export interface Snapshot {
  stock: Stock;
  date: Date;
  user: User;

  units: string;
  price: string;
  cost: string;
  value: string;
  changeSinceLast: string;
  normalisedPerformance: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  trusted: boolean;
  client_options: string;
  access_permissions: AccessPermission[]; // TODO: type properly
  created_at: Date;
  active: boolean;
}

export interface AccessPermission {
  user_id: number;
  access_for_id: number;
  read: boolean;
  write: boolean;
}

export interface Overview {
  total_value: string;
  all_time_change: string;
  num_providers: number;
  num_stocks: number;
  last_snapshot: Date;
  users?: {
    [key: string]: {
      total_value: string;
      all_time_change: string;
      num_providers: number;
      num_stocks: number;
      last_snapshot: Date;
      name: string;
    };
  };
}
