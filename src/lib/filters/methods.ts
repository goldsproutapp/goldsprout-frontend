import { FilterService } from 'primevue/api';

function areIterable(...args: any[]) {
  return args.every(
    (arg) =>
      arg && typeof arg == 'object' && typeof (arg.includes == 'function' || arg.has == 'function')
  );
}

function filterIncludesAny(value: Set<any>, filter: Array<any>): boolean {
  if (filter[0] === -1) return value.size == 0;
  if (!areIterable(value, filter)) return false;
  if (filter.length === 0) return true;
  return filter.some((v) => value.has(v));
}

function filterIncludesAll(value: Set<any>, filter: Array<any>): boolean {
  if (filter[0] === -1) return value.size == 0;
  if (!areIterable(value, filter)) return false;
  if (filter.length === 0) return true;
  return filter.every((v) => value.has(v));
}

export const CustomFilter = {
  INCLUDES_ANY: 'includes_any',
  INCLUDES_ALL: 'includes_all'
};

export function registerFilters() {
  FilterService.register(CustomFilter.INCLUDES_ANY, filterIncludesAny);
  FilterService.register(CustomFilter.INCLUDES_ALL, filterIncludesAll);
}
