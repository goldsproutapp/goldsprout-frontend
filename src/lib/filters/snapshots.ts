import { FilterMatchMode, FilterOperator } from 'primevue/api';
import type { DataTableFilterMeta } from 'primevue/datatable';

export function initalSnapshotFilter(): DataTableFilterMeta {
  return {
    global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
    },
    user_name: {
      value: null,
      matchMode: FilterMatchMode.IN
    },
    account_name: {
      value: null,
      matchMode: FilterMatchMode.IN
    },
    'stock.provider.name': {
      value: null,
      matchMode: FilterMatchMode.IN
    },
    units: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    },
    price: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    },
    cost: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    },
    value: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    },
    change_since_last: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    },
    normalised_performance: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.EQUALS
        }
      ]
    }
  };
}
