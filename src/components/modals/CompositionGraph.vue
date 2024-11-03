<script setup lang="ts">
import Chart from 'primevue/chart';
import { computed } from 'vue';
import { ref } from 'vue';

import 'chartjs-adapter-date-fns';

const props = defineProps<{ data: Object }>();

const graph = ref();
const opts = computed(() => {
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
            borderWidth: 5
          }
        ]
      },
      tooltip: {
        enabled: true
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
      }
    }
  };
});
const dataOpts = computed(() => {
  const sets = Object.entries(props.data).map(([k, v]) => {
    return {
      label: k,
      // @ts-ignore
      data: Object.entries(v).map(([k2, v2]) => ({ x: new Date(k2), y: parseFloat(v2) })),
      yAxisID: 'y',
      tension: 0.1
    };
  });
  return {
    datasets: sets
  };
});
</script>

<template>
  <Chart
    ref="graph"
    :data="dataOpts"
    :options="opts"
    type="line"
    v-if="data"
    class="performance-graph modal-graph"
  />
</template>

<style scoped></style>
