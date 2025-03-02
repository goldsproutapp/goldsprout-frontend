<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import PresetSelector from '@/components/select/PresetSelector.vue';
import { metricLabels } from '@/lib/constants';
import { formatDecimal } from '@/lib/data';
import { divergingColourScale } from '@/lib/formats/colours';
import { authenticatedRequest } from '@/lib/requests';
import { usePresets } from '@/lib/service/presets';
import { minmaxIgnoreOutliers } from '@/lib/utils';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { computed } from 'vue';
import { capitalize, ref, onActivated } from 'vue';

const comparisonOptions = ['Performance', 'Weighted Performance', 'Holdings', 'Growth'];
const targetOptions = ['Person', 'Provider', 'Account', 'Sector', 'Region', 'Stock', 'All'];
const timeOptions = ['Years', 'Quarters', 'Months'];

const useColourScale = ref(false);
const showTable = ref(false);

const formats: any = {
  Performance: '{}%',
  'Weighted Performance': '{}%',
  Holdings: '£{}',
  Growth: '{}%'
};

const data = ref<any>({});

const presets = usePresets(
  'trends',
  () => ({
    comparing: comparisonOptions[0],
    target: 'All',
    against: targetOptions[0],
    time: timeOptions[0],
    filters: {} as { [key: string]: string }
  }),
  {
    onChange: () => {
      update();
      setFilter();
    }
  }
);
const setFilter = () =>
  perfFilter.value ? perfFilter.value.setFilter(presets.selectedData.value.filters) : {};

const displayedOpts: any = ref(Object.assign(presets.selectedData.value));

const format = (str: string) =>
  formats[displayedOpts.value.comparing].replace('{}', formatDecimal(str));

onActivated(() => {
  update();
});

const metricDescription = ref('');

async function update() {
  const query = new URLSearchParams();

  const comparing = presets.selectedData.value.comparing;
  const comparisonKey = comparing.toLowerCase().replace(' ', '_');
  query.set('compare', comparisonKey);
  query.set('of', presets.selectedData.value.target.toLowerCase());
  query.set('for', presets.selectedData.value.against.toLowerCase());
  query.set('over', presets.selectedData.value.time.toLowerCase());
  Object.entries(presets.selectedData.value.filters).forEach(([key, value]) =>
    query.set(key, value)
  );
  const res = await authenticatedRequest(`/performance?${query.toString()}`);
  if (res.status === 200) {
    data.value = await res.json();
    showTable.value = true;
    displayedOpts.value = {
      comparing: comparing,
      target: presets.selectedData.value.target,
      against: presets.selectedData.value.against,
      time: presets.selectedData.value.time
    };
    useColourScale.value = comparing != 'Holdings';
    metricDescription.value = metricLabels[comparisonKey];
  }
}
const keys = computed(() => {
  if (!data.value.data) return [];
  const out = [];
  if (data.value.summary_row != '') {
    out.push(data.value.summary_row);
  }
  out.push(
    ...Object.keys(data.value.data).filter(
      (key) => data.value.summary_row == '' || data.value.summary_row != key
    )
  );
  return out;
});
const perfFilter = ref();
const focus = (i: number) => {
  if (i == data.value.time_focus.length) return;
  const f = data.value.time_focus[i];
  if (f.length == 0) return;
  perfFilter.value.timeFocus(f);
  presets.selectedData.value.time = capitalize(f[0]);
};

const colours = computed(() => {
  if (!useColourScale.value) return (_: any) => '';
  const numbers: number[] = Object.values(data.value.data)
    .map((x: any) => Object.values({ ...x.items, totals: x.totals }))
    .flat()
    .map((x: any) => Object.values(x))
    .flat()
    .map((x: any) => parseFloat(x));
  return divergingColourScale(
    minmaxIgnoreOutliers(numbers, 'min'),
    minmaxIgnoreOutliers(numbers, 'max')
  );
});
const scaleStyle = (num: string) =>
  num == undefined
    ? {}
    : {
        backgroundColor: colours.value(parseFloat(num))
      };
</script>

<template>
  <OptionFilterLayout>
    <template #header>
      <h1 class="title">Trends</h1>
    </template>

    <template #options>
      <div class="option-container">
        <span>
          Compare
          <Dropdown :options="comparisonOptions" v-model="presets.selectedData.value.comparing" />
          Of
          <Dropdown :options="targetOptions" v-model="presets.selectedData.value.target" />
          For
          <Dropdown :options="targetOptions" v-model="presets.selectedData.value.against" />
          Over
          <Dropdown :options="timeOptions" v-model="presets.selectedData.value.time" />
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
        ref="perfFilter"
      />
    </template>

    <template #body>
      <span>{{ metricDescription }}</span>
      <div class="comparison-container">
        <div class="table-container">
          <table class="comparison-table" v-if="showTable">
            <thead>
              <tr>
                <th>{{ displayedOpts.target }}</th>
                <th>{{ displayedOpts.against }}</th>
                <th
                  class="header-td"
                  v-for="(period, i) in data.time_periods"
                  :key="period"
                  @click="focus(i)"
                >
                  {{ period }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="col1 in keys">
                <tr class="category-separator">
                  <td>
                    <span
                      :style="
                        col1 == data.summary_row
                          ? { fontWeight: 'bold', textDecoration: 'underline' }
                          : {}
                      "
                      >{{ col1 }}</span
                    >
                  </td>
                  <td v-if="Object.keys(data.data[col1].items).length == 1">
                    {{ Object.keys(data.data[col1].items)[0] }}
                  </td>
                  <td v-else></td>
                  <td
                    v-for="period in data.time_periods"
                    :key="period"
                    :style="scaleStyle(data.data[col1].totals[period])"
                    :class="useColourScale ? 'coloured' : ''"
                  >
                    <span v-if="Object.keys(data.data[col1].totals).includes(period)">
                      <b>
                        {{ format(data.data[col1].totals[period]) }}
                      </b>
                    </span>
                  </td>
                </tr>
                <tr
                  v-for="item in Object.keys(data.data[col1].items)"
                  :key="item"
                  v-if="Object.keys(data.data[col1].items).length > 1"
                >
                  <td></td>
                  <td>
                    <span>{{ item }}</span>
                  </td>
                  <td
                    v-for="period in data.time_periods"
                    :key="period"
                    :style="scaleStyle(data.data[col1].items[item][period])"
                    :class="useColourScale ? 'coloured' : ''"
                  >
                    <span v-if="Object.keys(data.data[col1].items[item]).includes(period)"
                      >{{ format(data.data[col1].items[item][period]) }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </OptionFilterLayout>
</template>

<style scoped>
.comparison-container {
  display: flex;
  overflow: auto;
  margin-top: var(--inline-spacing);
}

.comparison-table {
  border-collapse: collapse;
  border: 2px solid var(--border-colour);
}

tr:not(.category-separator) td:not(.coloured) {
  border-top: 2px solid var(--border-colour);
}

tr:hover {
  background-color: var(--hover-colour);
}
tr:hover td.coloured {
  filter: saturate(50%);
}

th,
td {
  padding: 1rem;
}

.category-separator {
  border-top: 1px solid var(--text-colour);
}
.header-td {
  cursor: pointer;
}
.option-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
