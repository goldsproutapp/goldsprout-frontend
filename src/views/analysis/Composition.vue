<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import CompositionGraph from '@/components/modals/CompositionGraph.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import PresetSelector from '@/components/select/PresetSelector.vue';
import { backgroundColours, gridColour } from '@/lib/chartjs/colours';
import { htmlLegendPlugin } from '@/lib/chartjs/legend';
import { authenticatedRequest } from '@/lib/requests';
import { usePresets } from '@/lib/service/presets';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';
import { capitalize, onActivated, computed, ref } from 'vue';

const comparisonOptions: string[] = ['All', 'Region', 'Sector', 'Provider', 'Account', 'Stock'];
const comparisonTargetOptions: string[] = ['Person', 'Provider', 'Account'];
const filter = ref();

const fullscreenGraph = ref(false);
const graphModalRef = ref();
const timeGraphData = ref({});

const chartTypeOptions = ['Pie', 'Bar', 'Doughnut', 'Polar'];
const chartTypes: { [key: string]: string } = {
  Pie: 'pie',
  Bar: 'bar',
  Doughnut: 'doughnut',
  Polar: 'polarArea'
};
const cards = ref([]);
const loading = ref(true);

onActivated(() => {
  cards.value.forEach((card: any) => card.reinit());
});

const data = ref<any>({});

const presets = usePresets(
  'composition',
  () => ({
    compare: comparisonOptions[0],
    compareTarget: comparisonTargetOptions[0],
    chartType: chartTypeOptions[0],
    filters: {} as { [key: string]: string }
  }),
  {
    onChange: () => {
      setFilter();
      update();
    }
  }
);
const setFilter = () =>
  filter.value ? filter.value.setFilter(presets.selectedData.value.filters) : {};

function getQuery(): URLSearchParams {
  const query = new URLSearchParams();
  query.set('compare', presets.selectedData.value.compare.toLowerCase());
  query.set('across', presets.selectedData.value.compareTarget.toLowerCase());
  Object.entries(presets.selectedData.value.filters).forEach(([key, value]) =>
    query.set(key, value)
  );
  return query;
}

const update = () => {
  const query = getQuery();
  authenticatedRequest(`/split?${query.toString()}`).then((res) => {
    if (res.status != 200) return;
    res.json().then((json) => (data.value = json));
    loading.value = false;
  });
};
onActivated(update);
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

const showGraph = async (item: string) => {
  const query = getQuery();
  query.set('item', item);
  authenticatedRequest(`/split/history?${query.toString()}`).then((res) => {
    if (res.status != 200) return;
    res.json().then(({ data }) => (timeGraphData.value = data));
    fullscreenGraph.value = true;
  });
};

const containerID = (key: string) => `piechart-${key}`;

const options = computed(() => {
  const out: any = {};
  const polarOpts =
    presets.selectedData.value.chartType == 'Polar'
      ? {
          r: {
            grid: {
              color: gridColour()
            }
          }
        }
      : {};
  const scaleOpts = (data: any) =>
    presets.selectedData.value.chartType == 'Bar'
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
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => `${context.formattedValue}%`
            }
          },
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
const maximiseModal = () => {
  if (graphModalRef.value.maximized) return;
  graphModalRef.value.maximize();
};
</script>

<template>
  <Dialog
    v-model:visible="fullscreenGraph"
    header="Composition"
    modal
    maximizable
    ref="graphModalRef"
    @show="maximiseModal"
    :pt:maximizableButton:style="{ display: 'none' }"
  >
    <CompositionGraph :data="timeGraphData" class="modal-graph" />
  </Dialog>
  <OptionFilterLayout>
    <template #header>
      <h1 class="title">Composition</h1>
    </template>
    <template #options>
      <div class="option-container">
        <span>
          Compare
          <Dropdown :options="comparisonOptions" v-model="presets.selectedData.value.compare" />
          <template v-if="presets.selectedData.value.compare !== 'All'">
            Across
            <Dropdown
              :options="comparisonTargetOptions"
              v-model="presets.selectedData.value.compareTarget"
            />
          </template>
          <Button
            style="margin-left: 1rem"
            type="button"
            label="Calculate"
            severity="primary"
            @click="update"
          />
        </span>
        <PresetSelector :presets="presets" />
      </div>
    </template>
    <template #filter>
      <PerformanceFilter
        v-model="presets.selectedData.value.filters"
        @update="update"
        :upper-date-only="true"
        ref="filter"
      />
    </template>
    <template #body>
      <div style="margin: var(--inline-spacing)">
        <Dropdown :options="chartTypeOptions" v-model="presets.selectedData.value.chartType" />
      </div>
      <div v-if="loading" class="loading-container"><ProgressSpinner /></div>
      <div v-else-if="data.success && Object.keys(data.data).length > 0" class="pie-group">
        <Panel
          v-for="key in Object.keys(graphData)"
          :header="capitalize(key)"
          class="card-container"
          :pt:header:style="{ padding: 0 }"
        >
          <template #header>
            <div class="panel-header">
              <b>{{ capitalize(key) }}</b>
              <Button icon="pi pi-chart-line" text @click="showGraph(key)" />
            </div>
          </template>
          <div class="pie-container">
            <div :id="containerID(key)" class="legend-container"></div>
            <Chart
              ref="cards"
              :type="chartTypes[presets.selectedData.value.chartType]"
              :data="graphData[key]"
              :options="options[key]"
              style="height: 20rem"
              :plugins="[htmlLegendPlugin]"
            />
          </div>
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

.card-container {
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
.pie-container {
  display: flex;
  flex-wrap: wrap;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: 1rem;
}
.modal-graph {
  flex-grow: 1;
  min-height: 20rem;
  height: 100%;
}
.option-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--inline-spacing);
}
</style>
