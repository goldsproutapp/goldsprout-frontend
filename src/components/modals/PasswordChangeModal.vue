<script setup lang="ts">
import {ref} from 'vue';
import {validatePassword} from '@/lib/auth';
import {authenticatedRequest} from '@/lib/requests';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Button from 'primevue/button';
import {useToast} from 'primevue/usetoast';

const toast = useToast();

const pwChangeError = ref('');
const oldPw = ref();
const newPw = ref();
const newPwConfirmation = ref();
const save = async () => {
    if (!oldPw.value || !newPw.value) {
        pwChangeError.value = "You must enter a password.";
        return;
    }
    if (newPw.value !== newPwConfirmation.value) {
        pwChangeError.value = "New passwords do not match.";
        return;
    }
    const [valid, error] = validatePassword(newPw.value)
    if (!valid) {
        pwChangeError.value = error;
        return;
    }
    const payload = {
        old_password: oldPw.value,
        new_password: newPw.value,
    }
    const res = await authenticatedRequest('/changepassword', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
    if (res.status !== 200) {
        pwChangeError.value = "Old password is incorrect.";
        return;
    }
    toast.add({
        summary: 'Success',
        detail: 'Password successfully updated',
        severity: 'success',
        group: 'br',
        life: 2000,
    })
    visible.value = false;
};
const visible = defineModel<boolean>();
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Change password" class="dialog">
        <div class="pwchange-container">
            <Password class="pwchange-input" v-model="oldPw" :feedback="false" placeholder="Current password" />
            <Password class="pwchange-input" v-model="newPw" placeholder="New password" />
            <Password class="pwchange-input" v-model="newPwConfirmation" placeholder="Confirm new password" />
            <span style="margin-bottom: .5rem;color: var(--failure-colour);">{{ pwChangeError }}</span>
            <Button @click="save" label="Change password" severity="success" type="button" class="confirm-button" />
        </div>
    </Dialog>
</template>

<style scoped>
.pwchange-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
}

.pwchange-input {
    margin-bottom: 1rem;
}

.confirm-button {
    margin-top: 2rem;
}
</style>
