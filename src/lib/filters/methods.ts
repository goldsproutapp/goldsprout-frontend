import {FilterService} from "primevue/api";


function areArrays(...args: any[]) {
    return args.every(arg => arg
        && typeof arg == 'object'
        && typeof arg.includes == 'function');
}

function filterIncludesAny(value: Array<any>, filter: Array<any>): boolean {
    if (filter[0] === -1) return value.length == 0;
    if (!areArrays(value, filter)) return false;
    if (filter.length === 0) return true;
    return filter.some(v => value.includes(v));
}

function filterIncludesAll(value: Array<any>, filter: Array<any>): boolean {
    if (filter[0] === -1) return value.length == 0;
    if (!areArrays(value, filter)) return false;
    if (filter.length === 0) return true;
    return filter.every(v => value.includes(v));
}

export const CustomFilter = {
    INCLUDES_ANY: 'includes_any',
    INCLUDES_ALL: 'includes_all',
};

export function registerFilters() {
    FilterService.register(CustomFilter.INCLUDES_ANY, filterIncludesAny);
    FilterService.register(CustomFilter.INCLUDES_ALL, filterIncludesAll);
}
