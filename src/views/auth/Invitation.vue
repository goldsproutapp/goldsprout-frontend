<script setup lang="ts">
import Button from '@/components/buttons/Button.vue';
import TextInput from '@/components/select/TextInput.vue';
import {logIn} from '@/lib/auth';
import {API_BASE_URL} from '@/lib/constants';
import router from '@/router';
import {computed, ref} from 'vue';

const email = computed(() => {
    try {
        return atob(router.currentRoute.value.query.e?.toString() || '')
    } catch {
        return '';
    }
});
const pw = ref();
const confirmPw = ref();
const error = ref('');
const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
        error.value = 'Password must be at least 8 characters long';
        return false;
    }
    if (!password.match(/[0-9]/)) {
        error.value = 'Password must contain at least 1 number';
        return false;
    }
    if (!password.match(/[\W_]/)) {
        error.value = 'Password must contain at least 1 special character';
        return false;
    }
    return true;
}
const submit = async () => {
    if (!pw.value) {
        error.value = 'You must enter a password';
    }
    if (pw.value !== confirmPw.value) {
        error.value = "Passwords do not match";
        return;
    }
    if (!validatePassword(pw.value)) return;
    const payload = {
        token: router.currentRoute.value.query.t || '',
        password: pw.value,
    };
    const res = await fetch(API_BASE_URL + "/acceptInvitation", {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (res.status !== 201) {
        error.value = 'This invitation is invalid';
        return;
    }
    const json = await res.json()
    logIn(json.data);
};
</script>

<template>
    <h1>Invitation</h1>
    <form class="input-container" @submit.prevent>
        <span>To accept this invitation and create an account, choose a password.</span>
        <TextInput class="input" type="email" :placeholder="email" readonly />
        <TextInput class="input" type="password" placeholder="Password" v-model="pw" />
        <TextInput class="input" type="password" placeholder="Confirm password" v-model="confirmPw" />
        <Button colour-profile="success" @click="submit">Accept invitation</Button>
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
