<script setup lang="ts">
import { ref } from 'vue';
import { API_BASE_URL, DEMO_MODE_ENABLED } from '@/lib/constants';
import { logIn } from '@/lib/auth';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ResponsiveDivider from '@/components/layout/ResponsiveDivider.vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
const failure = ref(false);
const uname = ref();
const pw = ref();

const login = async () => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      Authorization: `${uname.value}:${pw.value}`
    }
  });
  if (res.status != 200) {
    failure.value = true;
    return;
  }
  const data = await res.json();
  logIn(data);
};
const demoLogin = () => {
  uname.value = 'demo';
  pw.value = 'demo';
  login();
};
</script>

<template>
  <div class="login-container">
    <div style="flex-basis: 0; flex-grow: 2"></div>
    <div class="title-container">
      <img src="/logo.png" width="50" />
      <div class="title-text-container">
        <h1 class="title">
          <span>Gold</span><span style="color: var(--accent-colour)">sprout</span>
        </h1>
        <span class="slogan">Nurture wealth</span>
      </div>
    </div>
    <div style="flex-basis: 0; flex-grow: 1"></div>
    <div class="form-container">
      <form class="form" @submit.prevent="login">
        <IconField iconPosition="left" class="input">
          <InputIcon class="pi pi-user"></InputIcon>
          <InputText type="text" name="username" placeholder="Username" v-model="uname" />
        </IconField>
        <IconField iconPosition="left" class="input">
          <InputIcon class="pi pi-lock"></InputIcon>
          <InputText type="password" name="password" placeholder="Password" v-model="pw" />
        </IconField>
        <Button type="submit" severity="success" label="Log in" />
        <span class="failure" v-if="failure">Incorrect username or password</span>
      </form>
      <template v-if="DEMO_MODE_ENABLED">
        <ResponsiveDivider landscape-direction="v">Or</ResponsiveDivider>
        <div class="demo-container">
          <Button severity="success" label="Use demo account" @click="demoLogin" />
          <span style="margin-top: var(--inline-spacing)" v-if="DEMO_MODE_ENABLED"></span>
        </div>
      </template>
    </div>
    <div style="flex-basis: 0; flex-grow: 3"></div>
    <h1>&nbsp;</h1>
  </div>
</template>

<style scoped>
h1 {
  font-size: xxx-large;
  margin-bottom: 0;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input,
button[type='submit'] {
  margin-top: 1rem;
}
.failure {
  margin-top: 1rem;
  color: var(--failure-colour);
}
.login-container {
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.form-container {
  display: flex;
  justify-content: center;
  margin: auto;
}
.demo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.divider-label {
  background-color: var(--surface-ground);
}
@media screen and (max-width: 650px) {
  .form-container {
    flex-direction: column;
  }
}
.title-container {
  display: flex;
}
.title-text-container {
  display: flex;
  flex-direction: column;
  align-items: end;
}
.slogan {
  font-style: italic;
  margin-top: 5px;
}
</style>
