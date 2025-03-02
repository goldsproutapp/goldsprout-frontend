<script setup lang="ts">
import { getProviderByID, getUserByID, getUserDisplayName } from '@/lib/data';
import { getAccounts, getProviderList, getRegions, getUsers } from '@/lib/requests';
import { dataState } from '@/lib/state';
import type { Provider, User } from '@/lib/types';
import { deepEqual } from '@/lib/utils';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Listbox from 'primevue/listbox';
import { nextTick, watch } from 'vue';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const selectedRegions = ref<string[]>([]);
const selectedProviders = ref<Provider[]>([]);
const selectedUsers = ref<User[]>([]);
const selectedAccounts = ref<string[]>([]);
const lowerDate = ref();
const upperDate = ref();
const model = defineModel();
const emit = defineEmits(['update']);
const props = withDefaults(
  defineProps<{
    upperDateOnly?: boolean;
    excludeFilters?: string[] | null;
  }>(),
  {
    upperDateOnly: false,
    excludeFilters: null
  }
);

onMounted(() => {
  getRegions(true);
  getProviderList(true);
  getUsers(true);
  getAccounts(true);
});

const filterObj = computed(() => {
  const obj: any = {};
  if (selectedRegions.value.length > 0) obj.filter_regions = selectedRegions.value.join(',');
  if (selectedProviders.value.length > 0)
    obj.filter_providers = selectedProviders.value.map((p) => p.id).join(',');
  if (selectedUsers.value.length > 0)
    obj.filter_users = selectedUsers.value.map((p) => p.id).join(',');
  if (selectedAccounts.value.length > 0) obj.filter_accounts = selectedAccounts.value.join(',');
  if (lowerDate.value) obj.filter_ignore_before = Math.floor(lowerDate.value.getTime() / 1000);
  if (upperDate.value) obj.filter_ignore_after = Math.floor(upperDate.value.getTime() / 1000);
  return obj;
});

const setFilter = async (obj: any) => {
  selectedRegions.value = obj.filter_regions ? obj.filter_regions.split(',') : [];
  selectedProviders.value = obj.filter_providers
    ? await Promise.all(obj.filter_providers.split(',').map(Number.parseInt).map(getProviderByID))
    : [];
  selectedUsers.value = obj.filter_users
    ? await Promise.all(obj.filter_users.split(',').map(Number.parseInt).map(getUserByID))
    : [];
  selectedAccounts.value = obj.filter_accounts ? obj.filter_accounts.split(',') : [];
  lowerDate.value = obj.filter_ignore_before ? new Date(obj.filter_ignore_before * 1000) : null;
  upperDate.value = obj.filter_ignore_after ? new Date(obj.filter_ignore_after * 1000) : null;
};

watch(filterObj, (obj, _) => {
  model.value = obj;
});
const timeFocus = (f: [string, number, number]) => {
  const [_, lower, upper] = f;
  lowerDate.value = new Date(lower * 1000);
  upperDate.value = new Date(upper * 1000);
  nextTick(() => emit('update'));
};
const reset = () => {
  [selectedRegions, selectedProviders, selectedUsers, selectedAccounts].forEach(
    (x) => (x.value = [])
  );
  [lowerDate, upperDate].forEach((x) => (x.value = null));
  nextTick(() => emit('update'));
};

const showFilter = (filter: string) =>
  props.excludeFilters == null || !props.excludeFilters.includes(filter);

defineExpose({
  timeFocus,
  setFilter
});
</script>

<template>
  <div>
    <h2>Filters</h2>
    <Button label="Update" severity="primary" class="update-btn" @click="$emit('update')" />
    <Button label="Reset" severity="secondary" class="update-btn" @click="reset" />
    <Accordion multiple :active-index="[]">
      <AccordionTab header="Regions" v-if="showFilter('regions')">
        <Listbox
          v-model="selectedRegions"
          :options="dataState.regions"
          multiple
          list-style="max-height: 20rem"
        />
      </AccordionTab>
      <AccordionTab header="Providers" v-if="showFilter('providers')">
        <Listbox
          v-model="selectedProviders"
          :options="dataState.providers"
          option-label="name"
          multiple
          list-style="max-height: 20rem"
        />
      </AccordionTab>
      <AccordionTab header="Accounts" v-if="showFilter('accounts')">
        <Listbox
          v-model="selectedAccounts"
          :options="Array.from(new Set(dataState.accounts.map((x) => x.name)))"
          multiple
          list-style="max-height: 20rem"
        />
      </AccordionTab>
      <AccordionTab header="Users" v-if="showFilter('users')">
        <Listbox
          v-model="selectedUsers"
          :options="dataState.users"
          :option-label="getUserDisplayName"
          multiple
          filter
          list-style="max-height: 20rem"
        />
      </AccordionTab>
      <AccordionTab header="Date" v-if="showFilter('date')">
        <Calendar
          selection-mode="single"
          view="month"
          show-button-bar
          v-model="lowerDate"
          placeholder="From"
          class="date-range-selector"
          v-if="!upperDateOnly"
        />
        <Calendar
          selection-mode="single"
          date-format="dd/mm/yy"
          view="month"
          show-button-bar
          v-model="upperDate"
          :placeholder="upperDateOnly ? 'Latest' : 'To'"
          class="date-range-selector"
        />
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped>
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.update-btn {
  width: 100%;
  margin-bottom: 1rem;
}

.date-range-selector {
  padding-bottom: 1rem;
}
</style>
