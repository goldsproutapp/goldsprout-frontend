<script setup lang="ts">
import Button from '@/components/buttons/Button.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import TextInput from '@/components/select/TextInput.vue';
import {saveAuthState} from '@/lib/auth';
import {getUserDisplayName} from '@/lib/data';
import {authenticatedRequest, getUserVisibility} from '@/lib/requests';
import {authState} from '@/lib/state';
import {type User} from '@/lib/types';
import {onMounted, ref} from 'vue';
import PasswordChangeModal from '@/components/modals/PasswordChangeModal.vue';

const {userInfo} = authState;
const editingInfo = ref(Object.assign({}, userInfo));
const visibility = ref<User[]>();
onMounted(() => getUserVisibility().then(res => visibility.value = res));
const editing = ref(false);

const message = ref('');
const messageColour = ref('var(--success-colour)');

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
        messageColour.value = 'var(--failure-colour)';
        message.value = 'Unable to update profile.';
        editingInfo.value = authState.userInfo;
        return;
    }
    const {data} = await res.json();
    authState.userInfo = data;
    saveAuthState();
    messageColour.value = 'var(--success-colour)';
    message.value = 'Successfully updated profile';
}

const changePasswordClose = (msg: string, colour: string) => {
    if (msg) {
        message.value = msg;
        messageColour.value = colour;
    }
    changingPassword.value = false;
}
</script>

<template>
    <div>
        <h1>Profile</h1>
        <div class="info-container">
            <span class="info-element">User ID:</span>
            <span class="info-element">{{ editingInfo.id }}</span>
            <span class="info-element">First name:</span>
            <TextInput v-model="editingInfo.first_name" class="input" :readonly="!editing" />
            <span class="info-element">Last name:</span>
            <TextInput v-model="editingInfo.last_name" class="input" :readonly="!editing" />
            <span class="info-element">Email address:</span>
            <span class="info-element">{{ editingInfo.email }}</span>
            <span class="info-element">Admin:</span>
            <span class="info-element">{{ editingInfo.is_admin }}</span>
            <span class="info-element">Account created:</span>
            <span class="info-element">{{ new Date(editingInfo.created_at).toLocaleDateString() }}</span>
            <Button v-if="!editing" @click="editing = true" colour-profile="neutral">Edit</Button>
            <template v-else>
                <Button colour-profile="failure" @click="cancel">Cancel</Button>
                <Button colour-profile="success" @click="update">Save</Button>
            </template>
            <span class="message" :style="{color: messageColour}">{{ message }}</span>
            <Button colour-profile="failure" style="margin-top: 1rem;" @click="changingPassword = true">Change
                password</Button>
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
        <PasswordChangeModal :changing-password="changingPassword" @close="changePasswordClose" />
    </div>
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
