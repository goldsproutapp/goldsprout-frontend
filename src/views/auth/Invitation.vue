<script setup lang="ts">
import { logIn, validatePassword } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/constants';
import router from '@/router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { computed, ref } from 'vue';

const email = computed(() => {
  try {
    return atob(router.currentRoute.value.query.e?.toString() || '');
  } catch {
    return '';
  }
});
const pw = ref();
const confirmPw = ref();
const error = ref('');
const submit = async () => {
  if (!pw.value) {
    error.value = 'You must enter a password';
  }
  if (pw.value !== confirmPw.value) {
    error.value = 'Passwords do not match';
    return;
  }
  const [isValid, validationError] = validatePassword(pw.value);
  if (!isValid) {
    error.value = validationError;
    return;
  }
  const payload = {
    token: router.currentRoute.value.query.t || '',
    password: pw.value
  };
  const res = await fetch(API_BASE_URL + '/acceptInvitation', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (res.status !== 201) {
    error.value = 'This invitation is invalid';
    return;
  }
  const json = await res.json();
  logIn(json.data);
};
</script>

<template>
  <h1>Invitation</h1>
  <form class="input-container" @submit.prevent>
    <span>To accept this invitation and create an account, choose a password.</span>
    <InputText class="input" type="email" v-model="email" disabled />
    <Password class="input" type="password" placeholder="Password" v-model="pw" />
    <Password class="input" type="password" placeholder="Confirm password" v-model="confirmPw" />
    <Button severity="success" @click="submit" label="Accept invitation" />
    <span class="error" v-if="error">{{ error }}</span>
  </form>
</template>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error {
  padding-top: 1rem;
  color: var(--failure-colour);
}

.input,
button {
  margin-top: 1rem;
}
</style>
