<script setup lang="ts">
import { authenticatedRequest, getSnapshots } from '@/lib/requests';
import { dataState } from '@/lib/state';
import router from '@/router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';

const snapshots = computed(() =>
  dataState.snapshots_latest.map((snapshot) => ({
    ...snapshot,
    stock_name: snapshot.stock?.name,
    date: snapshot.date.toLocaleDateString(),
    timestamp: snapshot.date,
    user_name: snapshot.user.first_name
  }))
);
const loading = ref(true);
onMounted(() => {
  loading.value = snapshots.value.length == 0;
  getSnapshots(true).then(() => (loading.value = false));
});
const headings = {
  user_name: 'User',
  stock_name: 'Name',
  units: 'Units',
  price: 'Price (£)',
  cost: 'Cost (£)',
  value: 'Value (£)',
  changeSinceLast: 'Change (£)',
  normalisedPerformance: 'Normalised performance (%)'
};
const toast = useToast();
const confirm = useConfirm();
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
      getSnapshots(false);
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
const deleteSnapshotButton = (evt: MouseEvent, id: string) => {
  confirm.require({
    target: (evt.currentTarget as HTMLElement) ?? null,
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
</script>

<template>
  <div>
    <h1>Snapshots</h1>
    <Button
      class="create-button"
      label="Create snapshot"
      severity="primary"
      @click="router.push('snapshots/create')"
    />
    <ConfirmDialog></ConfirmDialog>
    <DataTable :value="snapshots" :loading="loading">
      <template #empty v-if="!loading">No snapshots found.</template>
      <template #loading>
        <ProgressSpinner />
      </template>
      <Column header="Date" field="date" sortable sortField="timestamp" />
      <Column
        v-for="[key, display] in Object.entries(headings)"
        :key="key"
        :field="key"
        :header="display"
        sortable
      >
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            severity="danger"
            @click="deleteSnapshotButton($event, slotProps.data.id)"
          />
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
