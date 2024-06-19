<script setup lang="ts">
import { getUserDisplayName } from '@/lib/data';
import { getAccounts } from '@/lib/requests';
import { dataState } from '@/lib/state';
import router from '@/router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
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
    >
      <Column header="User">
        <template #body="{ data }">
          {{ getUserDisplayName(data.user) }}
        </template>
      </Column>
      <Column header="Provider">
        <template #body="{ data }">
          {{ data.provider.name }}
        </template>
      </Column>
      <Column header="Name">
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>
      <Column header="Value">
        <template #body="{ data }">
            £0
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.create-button {
  margin-bottom: 1rem;
}
</style>
