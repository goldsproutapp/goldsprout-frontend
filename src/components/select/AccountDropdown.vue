<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Dropdown from 'primevue/dropdown';
import type { Account } from '@/lib/types';
import { dataState } from '@/lib/state';
import { getAccounts } from '@/lib/requests';

const accountList = ref<Account[]>(dataState.accounts);

onMounted(() => getAccounts(true).then((accounts) => (accountList.value = accounts)));
const formatName = (account: Account) =>
  `${account.user?.first_name}'s ${account.name} with ${account.provider?.name}`;

const model = defineModel();
</script>
<template>
  <Dropdown v-model="model" :options="accountList" :option-label="formatName" />
</template>
