<script setup lang="ts">
import { formatDecimal } from '@/lib/data';
import { initalSnapshotFilter } from '@/lib/filters/snapshots';
import { authenticatedRequest } from '@/lib/requests';
import type { SnapshotTableInfo } from '@/lib/derived_types';
import router from '@/router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import MultiSelect from 'primevue/multiselect';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { PAGINATOR_PAGE_OPTIONS } from '@/lib/constants';
import { hasWritePermFor } from '@/lib/utils';

const toast = useToast();
const confirm = useConfirm();

const props = withDefaults(
  defineProps<{
    loading: boolean;
    snapshots: SnapshotTableInfo[];
    excludeHeadings?: string[] | null;
    paginate?: boolean;
  }>(),
  {
    excludeHeadings: null,
    paginate: false
  }
);

const emit = defineEmits(['update']);

const headings = {
  units: 'Units',
  price: 'Price (£)',
  cost: 'Cost (£)',
  value: 'Value (£)',
  change_since_last: 'Change (£)',
  normalised_performance: 'Normalised performance (%)'
};

const filters = ref(initalSnapshotFilter());

const deleteSnapshot = async (id: string) => {
  authenticatedRequest(`/snapshots/${id}`, {
    method: 'DELETE'
  })
    .then((res) => {
      if (res.status !== 204) {
        toast.add({
          summary: 'Error',
          detail: `An error ocurred while deleting that snapshot: ${res.statusText}`,
          group: 'bl',
          severity: 'error',
          life: 2000
        });
        return;
      }
      toast.add({
        summary: 'Success',
        detail: 'Successfully deleted snapshot',
        group: 'bl',
        severity: 'success',
        life: 2000
      });
      emit('update');
    })
    .catch((e) => {
      toast.add({
        summary: 'Error',
        detail: `An error ocurred while deleting that snapshot: ${e}`,
        group: 'bl',
        severity: 'error',
        life: 2000
      });
      return;
    });
};
const deleteSnapshotButton = (_: MouseEvent, id: string) => {
  confirm.require({
    header: 'Confirmation',
    message: 'Are you sure you want to permanently delete this snapshot?',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-success p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    accept: () => deleteSnapshot(id),
    reject: () => {}
  });
};
const showColumn = (column: string) =>
  props.excludeHeadings == null || !props.excludeHeadings.includes(column);

const clickColumnPT = {
  bodyCell: {
    style: 'padding: 0;height: 100%;',
    class: 'click-cell-td'
  }
};
</script>

<template>
  <DataTable
    :value="snapshots"
    :loading="loading"
    filter-display="menu"
    removable-sort
    v-model:filters="filters"
    :pt:table:style="'height: 1px'"
    :global-filter-fields="['stock_name']"
    :paginator="paginate"
    :rows="PAGINATOR_PAGE_OPTIONS[0]"
    :rows-per-page-options="PAGINATOR_PAGE_OPTIONS"
  >
    <template #header>
      <div class="table-header">
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          @click="filters = initalSnapshotFilter()"
        />
        <IconField icon-position="left" v-if="showColumn('stock_name')">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <!-- @vue-expect-error I don't know how to convince the 
                        compiler that filters.global does have a property 'value'
                    -->
          <InputText v-model="filters.global.value" placeholder="Quick search" />
        </IconField>
      </div>
    </template>
    <template #loading>
      <ProgressSpinner />
    </template>
    <template #empty v-if="!loading">
      No snapshots found.
      <br />
      <br />
      <RouterLink to="/snapshots/create">Create a snapshot</RouterLink> or
      <RouterLink to="/snapshots/import">import historical data</RouterLink>
    </template>
    <Column
      header="Date"
      field="date_string"
      sortable
      sortField="date"
      v-if="showColumn('date_string')"
    />
    <Column
      header="User"
      field="user_name"
      sortable
      :show-filter-match-modes="false"
      v-if="showColumn('user_name')"
    >
      <template #filter="{ filterModel }">
        <MultiSelect
          v-model="filterModel.value"
          :options="[...new Set(snapshots.map((x) => x.user_name))]"
          placeholder="Any"
        />
      </template>
    </Column>
    <Column
      v-if="showColumn('provider')"
      header="Provider"
      field="stock.provider.name"
      sortable
      :show-filter-match-modes="false"
    >
      <template #filter="{ filterModel }">
        <MultiSelect
          v-model="filterModel.value"
          :options="[...new Set(snapshots.map((x) => x.stock.provider.name))]"
          placeholder="Any"
        />
      </template>
    </Column>
    <Column
      header="Account"
      field="account_name"
      sortable
      :show-filter-match-modes="false"
      v-if="showColumn('account_name')"
      :pt="clickColumnPT"
    >
      <template #filter="{ filterModel }">
        <MultiSelect
          v-model="filterModel.value"
          :options="[...new Set(snapshots.map((x) => x.account_name))]"
          placeholder="Any"
        />
      </template>
      <template #body="{ data }">
        <div class="click-cell" @click="router.push(`/accounts/${data.account_id}`)">
          {{ data.account_name }}
        </div>
      </template>
    </Column>
    <Column
      v-if="showColumn('stock_name')"
      header="Stock"
      field="stock_name"
      sortable
      :pt="clickColumnPT"
    >
      <template #body="{ data }">
        <div class="click-cell" @click="router.push(`/stocks/${data.stock_id}`)">
          {{ data.stock_name }}
        </div>
      </template>
    </Column>
    <Column
      v-for="[key, display] in Object.entries(headings).filter(
        ([field, _]) => excludeHeadings == null || !excludeHeadings.includes(field)
      )"
      :key="key"
      :field="key"
      :header="display"
      v-show="showColumn(key)"
      data-type="numeric"
      sortable
    >
      <template #body="{ data }">
        {{ formatDecimal(data[key]) }}
      </template>
      <template #filter="{ filterModel }">
        <InputNumber v-model="filterModel.value" mode="decimal" :max-fraction-digits="2" />
      </template>
    </Column>
    <Column header="Actions" v-if="showColumn('actions')">
      <template #body="{ data }">
        <Button
          icon="pi pi-trash"
          severity="danger"
          @click="deleteSnapshotButton($event, data.id)"
          v-if="hasWritePermFor(data.user_id)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.click-cell {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 1rem;
}
.click-cell:hover {
  background-color: rgba(255, 255, 255, 0.03);
}
.table-header {
  display: flex;
  justify-content: space-between;
}
@media screen and (max-width: 500px) {
  .table-header {
    flex-direction: column;
    row-gap: var(--inline-spacing);
    align-items: start;
  }
}
</style>
<style>
.click-cell-td:hover {
  background-color: var(--surface-ground);
}
</style>
