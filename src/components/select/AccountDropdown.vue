<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Dropdown from 'primevue/dropdown';
import type { Account } from '@/lib/types';
import { dataState } from '@/lib/state';
import { getAccounts } from '@/lib/requests';
import { accountUniqueDisplay } from '@/lib/formats/display';

const accountList = ref<Account[]>(dataState.accounts);

onMounted(() => getAccounts(true).then((accounts) => (accountList.value = accounts)));

const model = defineModel();
</script>
<template>
  <Dropdown v-model="model" :options="accountList" :option-label="accountUniqueDisplay" />
</template>
