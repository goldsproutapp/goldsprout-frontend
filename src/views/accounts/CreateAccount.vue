<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import ProviderDropdown from '@/components/select/ProviderDropdown.vue';
import UserDropdown from '@/components/select/UserDropdown.vue';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';
import { authenticatedRequest, getAccounts } from '@/lib/requests';
import { authState } from '@/lib/state';
import type { Account } from '@/lib/types';
import router from '@/router';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const account = ref<Account>({
  id: 0,
  name: '',
  provider_id: 0,
  provider: null,
  user_id: 0,
  user: authState.userInfo
});

const toast = useToast();

const save = async () => {
  updateIDs();
  const payload = {
    ...account.value
  };

  const res = await authenticatedRequest('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const status = statusFrom(res.status);
  if (status !== StatusCode.Created) {
    toast.add({
      summary: 'Error',
      detail: `An error occurred while attempting to create account: ${statusText(status)}.`,
      group: 'bl',
      severity: 'error',
      life: 2000
    });
  } else {
    getAccounts(false);
    router.push('/accounts');
  }
};

const updateIDs = () => {
  account.value.provider_id = account.value.provider?.id ?? 0;
  account.value.user_id = account.value.user?.id ?? 0;
};
</script>

<template>
  <div class="container">
    <div class="input-item">
      <InputText placeholder="Name" v-model="account.name" type="text" />
    </div>
    <div class="input-item">
      <ProviderDropdown v-model="account.provider" />
    </div>
    <div class="input-item">
      <UserDropdown v-model="account.user" />
    </div>
    <div class="input-item">
      <SaveCancel @save="save" @cancel="router.back()" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
}

.input-item {
  padding-bottom: 1rem;
  display: flex;
  column-gap: 1rem;
}
</style>
