<script setup lang="ts">
import {ref} from 'vue';
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import TextInput from '@/components/select/TextInput.vue';
import Modal from '@/components/modals/Modal.vue';
import {validatePassword} from '@/lib/auth';
import {authenticatedRequest} from '@/lib/requests';

const pwChangeError = ref('');
const oldPw = ref();
const newPw = ref();
const newPwConfirmation = ref();
const emit = defineEmits<{
    close: [message: string, colour: string],
}>();
defineProps<{
    changingPassword: boolean,
}>();
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
    const res = await authenticatedRequest('/passwordchange', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
    if (res.status !== 200) {
        pwChangeError.value = "Old password is incorrect.";
        return;
    }
    emit('close', 'Password changed successfully', 'var(--success-colour)');
};
</script>

<template>
    <Modal v-if="changingPassword">
        <div>
            <div class="pwchange-container">
                <h1>Change password</h1>
                <TextInput class="pwchange-input" type="password" placeholder="Previous password" v-model="oldPw" />
                <TextInput class="pwchange-input" type="password" placeholder="New password" v-model="newPw" />
                <TextInput class="pwchange-input" type="password" placeholder="Confirm new password"
                    v-model="newPwConfirmation" />
                <span style="margin-bottom: .5rem;color: var(--failure-colour);">{{ pwChangeError }}</span>
                <div>
                    <SaveCancel @save="save" @cancel="$emit('close', '', '')" />
                </div>
            </div>
        </div>
    </Modal>
</template>

<style scoped>
.pwchange-container {
    display: flex;
    flex-direction: column;
}

.pwchange-input {
    margin-bottom: 1rem;
}
</style>
