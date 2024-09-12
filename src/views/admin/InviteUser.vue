<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import FormContainer from '@/components/layout/FormContainer.vue';
import { authenticatedRequest, getUsers } from '@/lib/requests';
import router from '@/router';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const email = ref();
const firstName = ref();
const lastName = ref();

const toast = useToast();

const submit = async () => {
  const payload = {
    email: email.value,
    first_name: firstName.value,
    last_name: lastName.value
  };
  const res = await authenticatedRequest('/invite', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (res.status == 209) {
    toast.add({
      summary: 'Error',
      detail: 'A user with this email address already exists',
      severity: 'error',
      group: 'bl',
      life: 3000
    });
  } else if (res.status != 201) {
    toast.add({
      summary: 'Error',
      detail: 'An unkown error occurred.',
      severity: 'error',
      group: 'bl',
      life: 3000
    });
  } else {
    toast.add({
      summary: 'Success',
      detail: 'An invitation has been sent by email.',
      severity: 'success',
      group: 'bl',
      life: 3000
    });
    getUsers(false);
    router.push('/users');
  }
};
</script>

<template>
  <div>
    <h1>Invite User</h1>
    <FormContainer>
      <InputText type="email" placeholder="Email address" v-model="email" />
      <InputText type="text" placeholder="First name" v-model="firstName" />
      <InputText type="text" placeholder="Last name" v-model="lastName" />
      <Message severity="warn" :closable="false"
        >Your name and email address will be visible to anyone you invite.</Message
      >
      <div class="save-cancel">
        <SaveCancel save-label="Invite" @save="submit" @cancel="router.back()" />
      </div>
    </FormContainer>
  </div>
</template>

<style scoped>
.save-cancel {
  display: flex;
  column-gap: 1rem;
}
</style>
