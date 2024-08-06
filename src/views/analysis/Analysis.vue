<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import { htmlLegendPlugin } from '@/lib/chartjs/legend';
import { authenticatedRequest } from '@/lib/requests';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import Panel from 'primevue/panel';
import { capitalize } from 'vue';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';

// I don't know yet what else can go here, but having this keeps the UI consistent.
const comparisonOptions: string[] = ['Split'];
const compare = ref(comparisonOptions[0]);
const comparisonTargetOptions: string[] = ['Portfolio'];
const compareTarget = ref(comparisonTargetOptions[0]);

const filterObj = ref<{ [key: string]: string }>({});

const data = ref<any>({});
const update = () => {
  const query = new URLSearchParams();
  Object.entries(filterObj.value).forEach(([key, value]) => query.set(key, value));
  authenticatedRequest(`/split?${query.toString()}`).then((res) => {
    if (res.status != 200) return;
    res.json().then((json) => (data.value = json));
  });
};
onMounted(update);
const graphData = computed(() => {
  if (!data.value.success) return;
  const out: any = {};
  Object.keys(data.value.data).forEach((key) => {
    out[key] = {
      labels: Object.keys(data.value.data[key]),
      datasets: [
        {
          // @ts-ignores
          data: Object.values(data.value.data[key]).map(parseFloat)
        }
      ]
    };
  });
  return out;
});

const containerID = (key: string) => `piechart-${key}`;

const options = computed(() => {
  const out: any = {};
  Object.keys(graphData.value).forEach(
    (key) =>
      (out[key] = {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          htmlLegend: {
            containerID: containerID(key)
          }
        }
      })
  );
  return out;
});
</script>

<template>
  <OptionFilterLayout>
    <template #header>
      <h1 class="title">Performance</h1>
    </template>
    <template #options>
      <span>
        Compare
        <Dropdown :options="comparisonOptions" v-model="compare" />
        Of
        <Dropdown :options="comparisonTargetOptions" v-model="compareTarget" />
        <Button
          style="margin-left: 1rem"
          type="button"
          label="Calculate"
          severity="primary"
          @click="update"
        />
      </span>
    </template>
    <template #filter>
      <PerformanceFilter v-model="filterObj" @update="update" :upper-date-only="true" />
    </template>
    <template #body>
      <div v-if="data.success" class="pie-group">
        <Panel
          v-for="key in Object.keys(graphData)"
          :header="capitalize(key)"
          class="pie-container"
        >
          <div :id="containerID(key)" class="legend-container"></div>
          <Chart
            type="pie"
            :data="graphData[key]"
            :options="options[key]"
            style="height: 20rem"
            :plugins="[htmlLegendPlugin]"
          />
        </Panel>
      </div>
    </template>
  </OptionFilterLayout>
</template>

<style scoped>
.pie-group {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
}

.pie-container {
  margin: var(--inline-spacing);
  flex-shrink: 1;
  max-width: 100%;
}

.pie-container:deep(.p-panel-content) {
  display: flex;
}

.legend-container {
  overflow-x: auto;
}
</style>
