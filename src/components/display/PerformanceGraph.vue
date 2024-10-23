<script setup lang="ts">
import { authenticatedRequest } from '@/lib/requests';
import Chart from 'primevue/chart';
import { capitalize, computed, onMounted, ref, watch } from 'vue';
import 'chartjs-adapter-date-fns';
import Dialog from 'primevue/dialog';

type PerformanceTarget = 'stock' | 'portfolio' | 'account';
const props = withDefaults(
  defineProps<{
    performanceType: PerformanceTarget;
    id: string;
    valueType?: 'value' | 'price';
  }>(),
  {
    valueType: 'value'
  }
);

const performance = ref<any>({});
const emit = defineEmits<{
  (e: 'ytd', ytd: number): void;
}>();

watch(performance, (p, _) => emit('ytd', Number.parseFloat(p.year_to_date)));
const fullScreen = ref(false);
const graph = ref();
const modal = ref();
const maximiseModal = () => {
  if (modal.value.maximized) return;
  modal.value.maximize();
};

const valueFormat = computed(() => (props.valueType == 'value' ? '£{}' : '{}p'));

const tooltipLabel = ({ formattedValue, datasetIndex }: any) =>
  [`${formattedValue}%`, valueFormat.value.replace('{}', formattedValue)][
    Math.min(datasetIndex, 1)
  ];

onMounted(() =>
  authenticatedRequest(`/${props.performanceType}performance?id=${props.id}`).then((res) =>
    res.status != 200 ? {} : res.json().then(({ data }) => (performance.value = data))
  )
);
const graphOptions = computed(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
  return {
    stacked: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      },
      annotation: {
        annotations: [
          {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: 0,
            borderColor: surfaceBorder,
            borderWidth: 5,
            label: {
              enabled: false,
              content: 'Test label'
            }
          }
        ]
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: tooltipLabel
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        },
        type: 'time'
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Performance',
          color: textColorSecondary
        },
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: capitalize(props.valueType),
          color: textColorSecondary
        },
        ticks: {
          color: textColorSecondary
        },
        grid: {
          drawOnChartArea: false,
          color: surfaceBorder
        }
      }
    }
  };
});
const performanceGraph = computed(() => {
  if (!performance.value.performance) {
    return null;
  }
  const costDataset =
    'cost' in performance.value
      ? [
          {
            label: 'Cost',
            data: Object.entries(performance.value.cost).map(([k, v]) =>
              // @ts-ignore
              ({ x: new Date(k), y: parseFloat(v) })
            ),
            yAxisID: 'y1',
            tension: 0.1
          }
        ]
      : [];
  return {
    datasets: [
      {
        label: 'Performance',
        data: Object.entries(performance.value.performance).map(([k, v]) =>
          // @ts-ignore
          ({ x: new Date(k), y: parseFloat(v) })
        ),
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: capitalize(props.valueType),
        data: Object.entries(performance.value.value).map(([k, v]) =>
          // @ts-ignore
          ({ x: new Date(k), y: parseFloat(v) })
        ),
        yAxisID: 'y1',
        tension: 0.1
      },
      ...costDataset
    ]
  };
});
</script>

<template>
  <i class="pi pi-expand" @click="fullScreen = true" />
  <Dialog
    v-model:visible="fullScreen"
    header="Performance"
    modal
    maximizable
    class="dialog"
    style="width: 100%"
    @show="maximiseModal"
    ref="modal"
    :pt:maximizableButton:style="{ display: 'none' }"
  >
    <Chart
      ref="graph"
      :data="performanceGraph"
      :options="graphOptions"
      type="line"
      v-if="performanceGraph"
      class="performance-graph modal-graph"
    />
  </Dialog>
  <Chart
    ref="graph"
    :data="performanceGraph"
    :options="graphOptions"
    type="line"
    v-show="!fullScreen"
    v-if="performanceGraph"
    class="performance-graph"
  />
  <div v-else class="no-data-container">
    <span class="no-data-label">No data available.</span>
  </div>
</template>

<style scoped>
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.no-data-label {
  font-size: x-large;
}
.performance-graph {
  flex-grow: 1;
  min-height: 20rem;
  height: 100%;
}
</style>
