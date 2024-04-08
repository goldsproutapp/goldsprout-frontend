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
        icon: 'fa-solid fa-screwdriver-wrench',
        colour: '',
        tooltip: 'This user is an administrator.',
    },
    attention: {
        icon: 'fa-solid fa-circle-exclamation',
        colour: 'var(--failure-colour)',
        tooltip: 'This item needs attention.',
    },
    invited: {
        icon: 'fa-solid fa-hourglass-half',
        colour: 'var(--warning-colour)',
        tooltip: 'This user\'s invitation is pending.',
    }
}
</script>

<template>
    <div v-if="preset != 'none'" v-tooltip.top="presets[preset].tooltip || ''" class="icon-wrapper">
    <font-awesome-icon :icon="presets[preset].icon" :color="presets[preset].colour" />
    </div>
</template>

<style scoped>
.icon-wrapper {
    display: inline;
}
</style>
