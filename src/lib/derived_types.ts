import type { Snapshot } from './types';

export type SnapshotTableInfo = Snapshot & {
  stock_name: string;
  account_name: string;
  date_string: string;
  user_name: string;
};
