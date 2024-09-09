<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CascadeSelect from 'primevue/cascadeselect';
import type { Account } from '@/lib/types';
import { dataState } from '@/lib/state';
import { getAccounts } from '@/lib/requests';
import { accountUniqueDisplay } from '@/lib/formats/display';
import { getUserDisplayName } from '@/lib/data';

const displayAccount = (id: number) =>
  // @ts-expect-error
  accountUniqueDisplay(accountList.value.find((a) => a.id === id));

const accountList = ref<Account[]>(dataState.accounts);
const accountTree = computed(() => {
  const users = dataState.users.map((u) => {
    const accounts = accountList.value.filter((a) => a.user_id == u.id);
    if (!accounts.length) return null;
    const providers = accounts.reduce(
      (acc, cur) => {
        if (cur.provider == null) return acc;
        acc[cur.provider.id] = {
          name: cur.provider.name,
          id: cur.provider.id,
          accounts: []
        };
        return acc;
      },
      {} as { [key: number]: { name: string; id: number; accounts: Array<Account> } }
    );
    accounts.forEach((a) => providers[a.provider_id].accounts.push(a));
    const out = {
      name: getUserDisplayName(u),
      id: u.id,
      providers: Object.values(providers)
    };
    return out;
  });
  return users.filter((u) => u != null);
});

onMounted(() => getAccounts(true).then((accounts) => (accountList.value = accounts)));

const model = defineModel();
</script>
<template>
  <CascadeSelect
    v-model="model"
    :options="accountTree"
    option-label="name"
    option-group-label="name"
    :option-group-children="['providers', 'accounts']"
    placeholder="Select an account"
    :loading="accountTree.length == 0"
  >
    <template #value="{ value, placeholder }">
      <template v-if="value === undefined">{{ placeholder }}</template>
      <template v-else>{{ displayAccount(value.id) }}</template>
    </template>
  </CascadeSelect>
</template>
