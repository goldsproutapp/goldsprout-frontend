<script setup lang="ts">
import InfoIcon from '@/components/icons/InfoIcon.vue';
import {saveAuthState} from '@/lib/auth';
import {getUserDisplayName} from '@/lib/data';
import {authenticatedRequest, getUserVisibility} from '@/lib/requests';
import {authState} from '@/lib/state';
import {type User} from '@/lib/types';
import {onMounted, ref} from 'vue';
import PasswordChangeModal from '@/components/modals/PasswordChangeModal.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import {useToast} from 'primevue/usetoast';

const toast = useToast();

const {userInfo} = authState;
const editingInfo = ref(Object.assign({}, userInfo));
const visibility = ref<User[]>();
onMounted(() => getUserVisibility().then(res => visibility.value = res));
const editing = ref(false);

const changingPassword = ref(false);

const cancel = () => {
    editing.value = false;
    editingInfo.value = Object.assign({}, userInfo);
}
const update = async () => {
    editing.value = false;
    const payload = editingInfo.value;
    const res = await authenticatedRequest('/user', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
    if (res.status !== 200) {
    toast.add({
        summary: 'Error',
        detail: 'Failed to update profile',
        group: 'br',
        severity: 'error',
        life: 2000,
    })
        editingInfo.value = authState.userInfo;
        return;
    }
    const {data} = await res.json();
    authState.userInfo = data;
    saveAuthState();
    toast.add({
        summary: 'Success',
        detail: 'Successfully updated profile',
        group: 'br',
        severity: 'success',
        life: 2000,
    })
}

</script>

<template>
    <div>
        <h1>Profile</h1>
        <div class="info-container">
            <span class="info-element">User ID:</span>
            <span class="info-element">{{ editingInfo.id }}</span>
            <span class="info-element">First name:</span>
            <InputText v-model="editingInfo.first_name" :readonly="!editing" />
            <span class="info-element">Last name:</span>
            <InputText v-model="editingInfo.last_name" :readonly="!editing" />
            <span class="info-element">Email address:</span>
            <span class="info-element">{{ editingInfo.email }}</span>
            <span class="info-element">Admin:</span>
            <span class="info-element">{{ editingInfo.is_admin }}</span>
            <span class="info-element">Account created:</span>
            <span class="info-element">{{ new Date(editingInfo.created_at).toLocaleDateString() }}</span>
            <Button v-if="!editing" @click="editing = true" severity="secondary" label="Edit"/>
            <template v-else>
                <Button severity="danger" @click="cancel" label="Cancel" />
                <Button severity="success" @click="update" label="Save" />
            </template>
            <Button severity="danger" style="grid-column: 1; margin-top: 1rem;" @click="changingPassword = true" label="Change password" />
        </div>
        <div class="access-info" v-if="visibility?.length">
            The following people have access to your data:
            <ul>
                <li v-for="user in visibility" :key="user.id">
                    <InfoIcon preset="admin" v-if="user.is_admin" />
                    {{ getUserDisplayName(user) }} ({{ user.email }})
                </li>
            </ul>
        </div>
        <PasswordChangeModal v-model="changingPassword" />
    </div>
</template>

<style scoped>
.info-container {
    display: grid;
    grid-template-columns: auto auto;
    width: max-content;
    grid-column-gap: 2rem;
    grid-row-gap: 1rem;
    margin-bottom: 1rem;
}

.info-element {
    display: inline-flex;
    align-items: center;
    margin-top: .2rem;
}

.info-label {
    grid-column: 1;
}

.info-value {
    grid-column: 2;
}

.input {
    margin-top: .2rem;
    margin-bottom: .2rem;
}

.message {
    grid-column: 1 / span 2;
}
</style>
