<script setup lang="ts">

const props = defineProps<{
    modelValue: any,
    strict?: boolean,
    options: string[],
    l_id: string,
}>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
        <div v-if="strict">
            <select :value="modelValue" @input="emit('update:modelValue', $event.target.value)">
                <option v-for="opt in options" :key="opt" :value="opt">{{opt}}</option>
            </select>
        </div>
        <div v-else>
            <input class="input" type="text" :list="`datalist-${l_id}`" :value="props.modelValue"
                @input="emit('update:modelValue', $event.target.value)" />
            <datalist :id="`datalist-${l_id}`">
                <option v-for="option in options" :key="option" :value="option"></option>
            </datalist>
        </div>
</template>

<style scoped>
select {
    background-color: var(--header-bg-colour);
    color: var(--text-colour);
    border: none;
    padding: .4rem;
    margin: .2rem;
    border-radius: .3rem;
}
</style>
