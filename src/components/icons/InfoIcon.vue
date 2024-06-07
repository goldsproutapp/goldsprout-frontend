<script setup lang="ts">
import type {RelativePosition} from '@/lib/options';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Tooltip from '../layout/Tooltip.vue';

const props = withDefaults(defineProps<{
    preset: keyof typeof presets,
    tooltipPosition?: RelativePosition,
}>(), {
    tooltipPosition: 'top',
});

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
    <div v-if="preset != 'none'" class="icon-wrapper">
        <Tooltip :position="tooltipPosition" :content="presets[preset].tooltip || ''" v-if="presets[preset].tooltip">
            <font-awesome-icon :icon="presets[preset].icon" :color="presets[preset].colour" />
        </Tooltip>
        <font-awesome-icon :icon="presets[preset].icon" :color="presets[preset].colour" v-else />
    </div>
</template>

<style scoped>
.icon-wrapper {
    display: inline;
}
</style>
