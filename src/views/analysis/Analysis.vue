<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import { backgroundColours, gridColour } from '@/lib/chartjs/colours';
import { htmlLegendPlugin } from '@/lib/chartjs/legend';
import { authenticatedRequest } from '@/lib/requests';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';
import { onActivated } from 'vue';
import { capitalize } from 'vue';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';

const comparisonOptions: string[] = ['All', 'Region', 'Sector', 'Provider', 'Account', 'Stock'];
const compare = ref(comparisonOptions[0]);
const comparisonTargetOptions: string[] = ['Person', 'Provider', 'Account'];
const compareTarget = ref(comparisonTargetOptions[0]);

const chartTypeOptions = ['Pie', 'Bar', 'Doughnut', 'Polar'];
const chartTypes: { [key: string]: string } = {
  Pie: 'pie',
  Bar: 'bar',
  Doughnut: 'doughnut',
  Polar: 'polarArea'
};
const chartType = ref(chartTypeOptions[0]);
const cards = ref([]);
const loading = ref(true);

const filterObj = ref<{ [key: string]: string }>({});
onActivated(() => {
  cards.value.forEach((card: any) => card.reinit());
});

const data = ref<any>({});
const update = () => {
  const query = new URLSearchParams();
  query.set('compare', compare.value.toLowerCase());
  query.set('across', compareTarget.value.toLowerCase());
  Object.entries(filterObj.value).forEach(([key, value]) => query.set(key, value));
  authenticatedRequest(`/split?${query.toString()}`).then((res) => {
    if (res.status != 200) return;
    res.json().then((json) => (data.value = json));
    loading.value = false;
  });
};
onMounted(update);
const graphData = computed(() => {
  if (!data.value.success) return;
  const out: any = {};
  Object.keys(data.value.data).forEach((key) => {
    const labels = Object.keys(data.value.data[key]);
    out[key] = {
      labels: labels,
      showLabels: Math.max(...labels.map((x) => x.length)) < 30,
      datasets: [
        {
          // @ts-ignores
          data: Object.values(data.value.data[key]).map(parseFloat),
          backgroundColor: backgroundColours()
        }
      ]
    };
  });
  return out;
});

const containerID = (key: string) => `piechart-${key}`;

const options = computed(() => {
  const out: any = {};
  const polarOpts =
    chartType.value == 'Polar'
      ? {
          r: {
            grid: {
              color: gridColour()
            }
          }
        }
      : {};
  const scaleOpts = (data: any) =>
    chartType.value == 'Bar'
      ? {
          scales: {
            x: {
              display: data.showLabels,
              grid: {
                display: false,
                color: gridColour()
              }
            },
            y: {
              border: {
                color: gridColour()
              },
              grid: {
                color: gridColour()
              }
            }
          }
        }
      : {
          scales: {
            x: {
              display: false
            },
            y: {
              display: false
            },
            ...polarOpts
          }
        };
  Object.keys(graphData.value).forEach(
    (key) =>
      (out[key] = {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          colors: {
            enabled: true
          },
          htmlLegend: {
            containerID: containerID(key)
          }
        },
        ...scaleOpts(graphData.value[key])
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
      <div style="display: flex; justify-content: space-between">
        <span>
          Compare
          <Dropdown :options="comparisonOptions" v-model="compare" />
          <template v-if="compare !== 'All'">
            Across
            <Dropdown :options="comparisonTargetOptions" v-model="compareTarget" />
          </template>
          <Button
            style="margin-left: 1rem"
            type="button"
            label="Calculate"
            severity="primary"
            @click="update"
          />
        </span>
        <Dropdown :options="chartTypeOptions" v-model="chartType" />
      </div>
    </template>
    <template #filter>
      <PerformanceFilter v-model="filterObj" @update="update" :upper-date-only="true" />
    </template>
    <template #body>
      <div v-if="loading" class="loading-container"><ProgressSpinner /></div>
      <div v-else-if="data.success && Object.keys(data.data).length > 0" class="pie-group">
        <Panel
          v-for="key in Object.keys(graphData)"
          :header="capitalize(key)"
          class="pie-container"
        >
          <div :id="containerID(key)" class="legend-container"></div>
          <Chart
            ref="cards"
            :type="chartTypes[chartType]"
            :data="graphData[key]"
            :options="options[key]"
            style="height: 20rem"
            :plugins="[htmlLegendPlugin]"
          />
        </Panel>
      </div>
      <div v-else>No data available for the selected options and filters.</div>
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
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
