<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import FormContainer from '@/components/layout/FormContainer.vue';
import {authenticatedRequest} from '@/lib/requests';
import router from '@/router';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';

const email = ref();
const firstName = ref();
const lastName = ref();

const message = ref();
const messageColour = ref();

const submit = async () => {
    const payload = {
        email: email.value,
        first_name: firstName.value,
        last_name: lastName.value,
    };
    const res = await authenticatedRequest('/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    messageColour.value = "var(--failure-colour)";
    if (res.status == 209) {
        message.value = "A user with this email address already exists";
    } else if (res.status != 201) {
        message.value = "An unkown error occurred."
    } else {
        messageColour.value = "var(--success-colour)";
        message.value = "An invitation has been sent by email.";
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
            <div class="save-cancel">
                <SaveCancel save-label="Invite" @save="submit" @cancel="router.back()" />
            </div>
            <span :style="{color: messageColour, paddingTop: '1rem',}">{{ message }}</span>
        </FormContainer>
    </div>
</template>

<style scoped>
.save-cancel {
    display: flex;
    column-gap: 1rem;
}
</style>
