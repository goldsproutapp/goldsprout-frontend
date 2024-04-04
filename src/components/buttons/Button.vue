<script setup lang="ts">
import {computed, type StyleValue} from 'vue';

type ColourProfile = 'success' | 'failure' | 'neutral';
const props = withDefaults(
    defineProps<{
        colourProfile?: ColourProfile,
        showBorder?: boolean,
    }>(), {
    colourProfile: 'neutral',
    showBorder: false,
});
const backgroundColours: {[key in ColourProfile]: string} = {
    success: 'var(--success-colour)',
    failure: 'var(--failure-colour)',
    neutral: 'var(--input-colour)',
}
const style = computed<StyleValue>(() => ({
    backgroundColor: backgroundColours[props.colourProfile],
    border: props.showBorder ? '1px solid var(--border-colour)' : 'none',
}));
</script>

<template>
    <button :style="style">
        <slot />
    </button>
</template>

<style scoped>
button {
    border-radius: .3rem;
    color: var(--text-colour);
    margin: .2rem;
    padding: .4rem;
}

button:hover {
    filter: saturate(50%);
}
</style>
