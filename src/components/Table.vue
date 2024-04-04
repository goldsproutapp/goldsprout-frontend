

<script setup lang="ts">
import InfoIcon from './icons/InfoIcon.vue';
import {presets} from './icons/InfoIcon.vue';

const props = defineProps<{
    headings: {[key: string]: string},
    rows: {[key: string]: any}[],
    styles: {[key: string]: string},
    clickHandler?: (row: {[key: string]: any}) => void,
    icons?: (row: any) => keyof typeof presets,
}>();

</script>

<template>
    <table class="stock-table">
        <tr>
            <th v-for="value in Object.values(headings)" :key="value">
                {{ value }}
            </th>
        </tr>
        <tr v-for="row in rows" :key="row.id" class="stock-row" @click="clickHandler ? clickHandler(row) : () => {}">
            <td v-for="key in Object.keys(headings)" :key="key"
                :style="Object.keys(styles).includes(key) ? styles[key] : ''">
                {{ row[key] }}
            </td>
            <td v-if="props.icons && props.icons(row)">
                <InfoIcon :preset="props.icons(row)" />
            </td>
        </tr>
    </table>
</template>

<style scoped>
tr {
    border-bottom: 1px solid var(--border-colour);
}

th {
    width: min-content;
    text-align: left;
}


.stock-table {
    width: 100%;
    border-collapse: collapse;
}

.stock-row {
    cursor: pointer;
}

.stock-row:hover {
    background-color: var(--hover-colour);
}

@media screen and (max-width: 1250px) {

    td,
    th {
        border-left: 1px solid var(--border-colour);
        border-right: 1px solid var(--border-colour);
    }

    th {
        border-top: 1px solid var(--border-colour);
    }
}
</style>

