
import {FilterOperator, FilterMatchMode} from 'primevue/api';
import type {DataTableFilterMeta} from 'primevue/datatable';
import {CustomFilter} from './methods';

export function initialStockFilter(): DataTableFilterMeta {
    return {
        global: {
            value: null,
            matchMode: FilterMatchMode.CONTAINS,
        },
        provider_name: {
            value: null,
            matchMode: FilterMatchMode.IN,
        },
        name: {
            operator: FilterOperator.AND,
            constraints: [
                {
                    value: null,
                    matchMode: FilterMatchMode.CONTAINS,
                }
            ],
        },
        sector: {
            value: null,
            matchMode: FilterMatchMode.IN,
        },
        region: {
            value: null,
            matchMode: FilterMatchMode.IN,
        },
        total_fee: {
            operator: FilterOperator.AND,
            constraints: [
                {
                    value: null,
                    matchMode: FilterMatchMode.EQUALS,
                }
            ]
        },
        users: {
            value: [],
            matchMode: CustomFilter.INCLUDES_ANY,
        },
    };
}
