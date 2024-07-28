import type { Account } from '../types';

export function accountUniqueDisplay(account: Account): string {
  return `${account.user?.first_name}'s ${account.name} with ${account.provider?.name}`;
}
