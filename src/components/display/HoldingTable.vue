<script setup lang="ts">
import { formatDecimal } from '@/lib/data';

defineProps<{
  holdings: any;
  keyDisplay: (x: any) => string;
}>();
</script>
<template>
  <table v-if="holdings !== null" class="holding-table">
    <tbody>
      <tr v-for="[key, value] in holdings" :key="key">
        <td>{{ keyDisplay(key) }}</td>
        <td v-if="value == '0'">Previously held</td>
        <td v-else>£{{ formatDecimal(value) }}</td>
      </tr>
    </tbody>
  </table>
  <div v-else></div>
</template>

<style scoped></style>
