<script setup lang="ts">
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
const props = defineProps<{
    preset: keyof typeof presets,
}>();

</script>

<script lang="ts">
export const presets = {
    none: {},
    admin: {
        icon: "fa-solid fa-screwdriver-wrench",
        colour: '',
        //tooltip: "This user is an administrator.",
    },
    attention: {
        icon: "fa-solid fa-circle-exclamation",
        colour: 'var(--failure-colour)',
    },
    pending: {
        icon: 'fa-solid fa-hourglass-half',
        colour: 'var(--warning-colour)',
    }
}
</script>

<template>
    <font-awesome-icon v-if="preset != 'none'" :icon="presets[preset].icon" :color="presets[preset].colour" />
</template>

<style scoped>
</style>
