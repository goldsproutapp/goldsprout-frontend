<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import { getUserByID, getUserDisplayName } from '@/lib/data';
import { authenticatedRequest, getUsers } from '@/lib/requests';
import { dataState } from '@/lib/state';
import { type AccessPermission, type User } from '@/lib/types';
import router from '@/router';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputSwitch from 'primevue/inputswitch';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';

const props = defineProps<{
  id: string;
}>();

const toast = useToast();

type Permission = AccessPermission & { access_for: string };
const user = ref<User | null>();

watch(
  props,
  ({ id }, _) => {
    if (id !== undefined)
      getUserByID(parseInt(id)).then((result) => (user.value = result ? result : user.value));
  },
  {
    immediate: true
  }
);
const perms = ref<{ [key: string]: Permission }>();
watch(user, (next, _) => {
  if (next == null) return;
  generatePerms(next).then((result) => (perms.value = result));
});
const generatePerms = async (u: User): Promise<{ [key: string]: Permission }> => {
  const out: { [key: string]: Permission } = {};
  dataState.users.forEach(
    (user) =>
      (out[user.id.toString()] = {
        access_for_id: user.id,
        access_for: getUserDisplayName(user),
        read: false,
        write: false,
        user_id: u.id
      })
  );
  if (u.access_permissions)
    await Promise.all(
      u.access_permissions.map(
        async (perm) =>
          (out[perm.access_for_id.toString()] = {
            ...perm,
            access_for: getUserDisplayName(await getUserByID(perm.access_for_id))
          })
      )
    );
  return out;
};
const process = async () => {
  if (!user.value || !perms.value) return; // TODO: error handling
  const payload = {
    user: user.value.id,
    trusted: user.value.trusted,
    permissions: Object.values(perms.value).map((perm) => ({
      for_user: perm.access_for_id,
      read: perm.read,
      write: perm.write
    }))
  };
  const res = await authenticatedRequest('/permissions', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  const status = statusFrom(res.status);
  if (status === StatusCode.OK) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Permissions successfully updated',
      life: 2000,
      group: 'br'
    });
    getUsers(false);
    router.push('/users');
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to update permissions: ${statusText(status)}`,
      life: 2000,
      group: 'br'
    });
  }
};
</script>

<template>
  <div v-if="user">
    <h2>User info</h2>
    <div class="info-container">
      <span class="info-element">User ID:</span>
      <span class="info-element">{{ user.id }}</span>
      <span class="info-element">First name:</span>
      <span class="info-element">{{ user.first_name }}</span>
      <span class="info-element">Last name:</span>
      <span class="info-element">{{ user.last_name }}</span>
      <span class="info-element">Email address:</span>
      <span class="info-element">{{ user.email }}</span>
      <span class="info-element">Admin:</span>
      <span class="info-element">{{ user.is_admin }}</span>
      <span class="info-element">Account created:</span>
      <span class="info-element">{{ new Date(user.created_at).toLocaleDateString() }}</span>
    </div>
    <h2>Permissions</h2>
    <div class="trusted-input">
      <span v-tooltip="'Allow this user permission to make changes that may affect other users.'"
        >Trusted:</span
      >
      <InputSwitch v-model="user.trusted" />
    </div>
    <DataTable v-if="perms" :value="Object.values(perms)">
      <Column field="access_for" header="Name"></Column>
      <Column field="read" header="Read">
        <template #body="row">
          <Checkbox v-model="perms[row.data.access_for_id].read" :binary="true" />
        </template>
      </Column>
      <Column field="write" header="Write">
        <template #body="row">
          <Checkbox v-model="perms[row.data.access_for_id].write" :binary="true" />
        </template>
      </Column>
    </DataTable>
    <div class="save-cancel">
      <SaveCancel @save="process" @cancel="router.back()" />
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.info-container {
  display: grid;
  grid-template-columns: auto auto;
  width: max-content;
  grid-column-gap: 1rem;
  margin-bottom: 1rem;
}

.info-element {
  display: inline-flex;
  align-items: center;
  margin-top: 0.2rem;
}

.save-cancel {
  margin-top: 1rem;
  display: flex;
  column-gap: 1rem;
}

.trusted-input {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.trusted-input span {
  margin-right: 1rem;
  text-decoration: underline;
  text-decoration-style: dotted;
}
</style>
