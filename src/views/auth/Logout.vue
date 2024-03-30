<script setup lang="ts">
import {onMounted} from 'vue';
import { logOut } from '@/lib/auth';
import router from '@/router';

onMounted(() => {
    logOut();
    router.push('/')
});
</script>

<template></template>
