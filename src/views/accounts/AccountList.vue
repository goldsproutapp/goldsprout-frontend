<script setup lang="ts">
import { formatDecimal, getUserDisplayName } from '@/lib/data';
import { getAccounts } from '@/lib/requests';
import { dataState } from '@/lib/state';
import type { Account } from '@/lib/types';
import router from '@/router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressSpinner from 'primevue/progressspinner';
import { onMounted } from 'vue';
const providers: any = [];
const headings = {};
onMounted(() => getAccounts(true));
</script>

<template>
  <div>
    <h1>Accounts</h1>
    <Button
      class="create-button"
      @click="router.push('accounts/create')"
      label="Create account"
      severity="primary"
    />
    <DataTable
      :value="dataState.accounts"
      selection-mode="single"
      @row-select="(row) => router.push(`/accounts/${row.data.id}`)"
      :loading="!dataState.accounts.length"
      removable-sort
    >
      <template #loading>
        <ProgressSpinner />
      </template>
      <Column header="User" sortable :sort-field="(acc: Account) => getUserDisplayName(acc.user)">
        <template #body="{ data }">
          {{ getUserDisplayName(data.user) }}
        </template>
      </Column>
      <Column header="Provider" sortable sort-field="provider.name">
        <template #body="{ data }">
          {{ data.provider.name }}
        </template>
      </Column>
      <Column header="Name" sortable sort-field="name">
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>
      <Column header="Value" sortable data-type="numeric" sort-field="value">
        <template #body="{ data }"> £{{ formatDecimal(data.value) }} </template>
      </Column>
      <Column header="Holdings" sortable sort-field="stock_count">
        <template #body="{ data }">{{ data.stock_count }} </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.create-button {
  margin-bottom: 1rem;
}
</style>
