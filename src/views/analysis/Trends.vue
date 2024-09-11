<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import { formatDecimal } from '@/lib/data';
import { authenticatedRequest } from '@/lib/requests';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { capitalize, ref, onActivated } from 'vue';

const comparisonOptions = ['Performance', 'Weighted Performance', 'Holdings'];
const comparing = ref(comparisonOptions[0]);

const targetOptions = ['Person', 'Provider', 'Account', 'Sector', 'Region', 'Stock', 'All'];

const formats: any = {
  Performance: '{}%',
  'Weighted Performance': '{}%',
  Holdings: '£{}'
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
  }
};
const focus = (i: number) => {
  if (i == data.value.time_focus.length) return;
  const focus = data.value.time_focus[i];
  if (focus.length == 0) return;
  const [period, lower, upper] = focus;
  time.value = capitalize(period);
  filterObj.value.filter_ignore_before = lower;
  filterObj.value.filter_ignore_after = upper;
  update();
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
      <PerformanceFilter v-model="filterObj" @update="update" />
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
                  <td></td>
                  <td v-for="period in data.time_periods" :key="period">
                    <span v-if="Object.keys(data.data[col1].totals).includes(period)">{{
                      format(data.data[col1].totals[period])
                    }}</span>
                  </td>
                </tr>
                <tr v-for="item in Object.keys(data.data[col1].items)" :key="item">
                  <td></td>
                  <td>
                    <span>{{ item }}</span>
                  </td>
                  <td v-for="period in data.time_periods" :key="period">
                    <span v-if="Object.keys(data.data[col1].items[item]).includes(period)">{{
                      format(data.data[col1].items[item][period])
                    }}</span>
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

tr:not(.category-separator) {
  border-top: 2px solid var(--border-colour);
}

tr:hover {
  background-color: var(--hover-colour);
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
