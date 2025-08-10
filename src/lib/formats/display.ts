import type { Account } from '../types';

export function accountUniqueDisplay(account: Account): string {
  return `${account.user?.first_name}'s ${account.name} with ${account.provider?.name}`;
}

export function summariseComposition(composition: { [key: string]: number }): string {
  const arr = Object.entries(composition).map(([k, v]) => `${k}: ${v}%`);
  return arr.join(", ");
}
