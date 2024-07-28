<script setup lang="ts">
import { authenticatedRequest } from '@/lib/requests';
import Chart from 'primevue/chart';
import { computed, onMounted, ref, watch } from 'vue';
import 'chartjs-adapter-date-fns';

type PerformanceTarget = 'stock' | 'portfolio' | 'account';
const props = defineProps<{
  performanceType: PerformanceTarget;
  id: string;
}>();

const performance = ref<any>({});
const emit = defineEmits<{
  (e: 'ytd', ytd: number): void;
}>();

watch(performance, (p, _) => emit('ytd', Number.parseFloat(p.year_to_date)));

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
        label: 'Value',
        data: Object.entries(performance.value.value).map(([k, v]) =>
          // @ts-ignore
          ({ x: new Date(k), y: parseFloat(v) })
        ),
        yAxisID: 'y1',
        tension: 0.1
      }
    ]
  };
});
</script>

<template>
  <Chart
    :data="performanceGraph"
    :options="graphOptions"
    type="line"
    v-if="performanceGraph"
    style="flex-grow: 1"
  />
  <div v-else></div>
</template>

<style scoped></style>
