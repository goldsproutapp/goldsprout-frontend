<script setup lang="ts">
import { getSnapshots } from '@/lib/requests';
import { dataState } from '@/lib/state';
import router from '@/router';
import Button from 'primevue/button';
import { computed, onActivated, ref } from 'vue';
import SnapshotTable from '@/components/display/SnapshotTable.vue';
import type { SnapshotTableInfo } from '@/lib/derived_types';
import { snapshotTableInfo } from '@/lib/data';

const snapshots = computed<SnapshotTableInfo[]>(() =>
  dataState.snapshots_latest.map(snapshotTableInfo)
);
const loading = ref(true);
onActivated(() => {
  loading.value = snapshots.value.length == 0;
  getSnapshots(true).then(() => (loading.value = false));
});
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
    <SnapshotTable
      :loading="loading"
      :snapshots="snapshots"
      @update="getSnapshots(false)"
      paginate
    />
  </div>
</template>

<style scoped>
.create-button {
  margin-bottom: 1rem;
}
</style>
