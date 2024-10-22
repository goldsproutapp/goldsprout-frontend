<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import { formatDecimal } from '@/lib/data';
import { divergingColourScale } from '@/lib/formats/colours';
import { authenticatedRequest } from '@/lib/requests';
import { minmaxIgnoreOutliers } from '@/lib/utils';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { computed } from 'vue';
import { capitalize, ref, onActivated } from 'vue';

const comparisonOptions = ['Performance', 'Weighted Performance', 'Holdings', 'Growth'];
const comparing = ref(comparisonOptions[0]);
const useColourScale = ref(false);

const targetOptions = ['Person', 'Provider', 'Account', 'Sector', 'Region', 'Stock', 'All'];

const formats: any = {
  Performance: '{}%',
  'Weighted Performance': '{}%',
  Holdings: '£{}',
  Growth: '{}%'
};
const target = ref('All');
const against = ref(targetOptions[0]);
const timeOptions = ['Years', 'Quarters', 'Months'];
const time = ref(timeOptions[0]);

const showTable = ref(false);

const data = ref<any>({});

const displayedOpts: any = ref({
  comparing: comparing.value,
  target: target.value,
  against: against.value,
  time: time.value
});
const format = (str: string) =>
  formats[displayedOpts.value.comparing].replace('{}', formatDecimal(str));
const filterObj = ref<{ [key: string]: string }>({});

onActivated(async () => {
  update();
});

const update = async () => {
  const query = new URLSearchParams();

  query.set('compare', comparing.value.toLowerCase().replace(' ', '_'));
  query.set('of', target.value.toLowerCase());
  query.set('for', against.value.toLowerCase());
  query.set('over', time.value.toLowerCase());
  Object.entries(filterObj.value).forEach(([key, value]) => query.set(key, value));
  const res = await authenticatedRequest(`/performance?${query.toString()}`);
  if (res.status === 200) {
    data.value = await res.json();
    showTable.value = true;
    displayedOpts.value = {
      comparing: comparing.value,
      target: target.value,
      against: against.value,
      time: time.value
    };
    useColourScale.value = comparing.value != 'Holdings';
  }
};
const perfFilter = ref();
const focus = (i: number) => {
  if (i == data.value.time_focus.length) return;
  const f = data.value.time_focus[i];
  if (f.length == 0) return;
  perfFilter.value.timeFocus(f);
  time.value = capitalize(f[0]);
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
      <span>
        Compare
        <Dropdown :options="comparisonOptions" v-model="comparing" />
        Of
        <Dropdown :options="targetOptions" v-model="target" />
        For
        <Dropdown :options="targetOptions" v-model="against" />
        Over
        <Dropdown :options="timeOptions" v-model="time" />
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
      <PerformanceFilter v-model="filterObj" @update="update" ref="perfFilter" />
    </template>

    <template #body>
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
              <template v-for="col1 in Object.keys(data.data)">
                <tr class="category-separator">
                  <td>
                    <span>{{ col1 }}</span>
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
</style>
