<script setup lang="ts">
import { getProviderList } from '@/lib/requests';
import { dataState } from '@/lib/state';
import router from '@/router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, onActivated } from 'vue';
onActivated(() => getProviderList(true));
const providers = computed(() => dataState.providers);
const headings = {
  name: 'Name',
  csv_format: 'Snapshot format'
};
</script>

<template>
  <div>
    <h1>Providers</h1>
    <Button
      class="create-button"
      @click="router.push('providers/create')"
      label="Create provider"
      severity="primary"
    />
    <DataTable
      :value="providers"
      selection-mode="single"
      @row-select="(row) => router.push(`/providers/${row.data.id}`)"
    >
      <Column
        v-for="[key, display] in Object.entries(headings)"
        :key="key"
        :field="key"
        :header="display"
      ></Column>
      <Column :field="(x) => `${x.annual_fee ?? 0}%`" header="Fee"></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.create-button {
  margin-bottom: 1rem;
}
</style>
