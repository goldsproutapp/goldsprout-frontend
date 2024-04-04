
<script setup lang="ts">
import {ref} from 'vue';
import { API_BASE_URL } from '@/lib/constants';
import { logIn } from '@/lib/auth';
import Button from '@/components/buttons/Button.vue';
const failure = ref(false);
const uname = ref();
const pw = ref();

const login = async () => {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            Authorization: `${uname.value}:${pw.value}`
        }
    });
    if (res.status != 200) {
        failure.value = true;
        return
    }
    const data = await res.json();
    logIn(data)
}
</script>

<template>
    <form class="form" @submit.prevent="login">
        <input type="text" name="username" placeholder="Username" v-model="uname">
        <input type="password" name="password" placeholder="Password" v-model="pw">
        <Button type="submit" colour-profile="success">Log in</Button>
        <span class="failure" v-if="failure">Incorrect username or password</span>
    </form>
</template>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
    align-items: center;
}
input,
button {
    margin-top: 1rem;
}
input {
    border-color: transparent;
    background-color: var(--input-colour);
    border-radius: .5rem;
    color: var(--text-colour);
    padding: .5rem;
    outline: none;
}
.failure {
    margin-top: 1rem;
    color: var(--failure-colour);
}
</style>
