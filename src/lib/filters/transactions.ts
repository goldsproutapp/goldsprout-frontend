import { FilterOperator, FilterMatchMode } from 'primevue/api';
import type { DataTableFilterMeta } from 'primevue/datatable';

export function initialTransactionFilter(): DataTableFilterMeta {
  return {
    global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
    },
    tag: {
      value: null,
      matchMode: FilterMatchMode.IN
    },
    'account.id': {
      value: null,
      matchMode: FilterMatchMode.IN
    },
    'stock.name': {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: null,
          matchMode: FilterMatchMode.CONTAINS
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
    }
  };
}
