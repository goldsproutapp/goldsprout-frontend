<script setup lang="ts">
import CountUp from '@/components/display/CountUp.vue';
import { getOverview } from '@/lib/requests';
import type { Overview } from '@/lib/types';
import { onMounted, ref } from 'vue';
import PerformanceGraph from './performance/PerformanceGraph.vue';
import Carousel from 'primevue/carousel';
import { formatDecimal } from '@/lib/data';
import Divider from 'primevue/divider';
import SummaryCards from '@/components/display/SummaryCards.vue';
import SummaryCard from '@/components/display/SummaryCard.vue';

const overview = ref<Overview | null>();

onMounted(() => getOverview(false).then((res) => (overview.value = res)));
</script>

<template>
  <div class="container">
    <h1>Overview</h1>
    <div v-if="overview != null" class="overview">
      <SummaryCards>
        <SummaryCard>
          <template #title> Portfolio value </template>
          <template #content>
            £
            <CountUp
              :value="parseFloat(overview.total_value)"
              :duration="750"
              :decimal-precision="2"
            />
          </template>
        </SummaryCard>

        <SummaryCard>
          <template #title> All time </template>
          <template #content>
            <CountUp
              :value="parseFloat(overview.all_time_change)"
              :duration="750"
              :decimal-precision="2"
              :coloured="true"
              :format="
                (v: number, d: number) =>
                  v < 0
                    ? `-£${formatDecimal(v.toFixed(d).slice(1))}`
                    : `+£${formatDecimal(v.toFixed(d))}`
              "
            />
          </template>
        </SummaryCard>
        <SummaryCard>
          <template #title> Last snapshot </template>
          <template #content>
            {{ overview.last_snapshot.toLocaleDateString() }}
          </template>
        </SummaryCard>
        <SummaryCard v-if="overview.users" style="max-width: 40rem" :padding="false">
          <template #content>
            <Carousel
              :value="Object.keys(overview.users)"
              :num-visible="1"
              circular
              :autoplay-interval="4000"
            >
              <template #item="slotProps">
                <h2>{{ overview.users[slotProps.data].name }}</h2>
                <div class="carousel-item">
                  £{{ formatDecimal(overview.users[slotProps.data].total_value) }}
                  <Divider layout="vertical" class="hdiv" />
                  <Divider layout="horizontal" class="vdiv" />
                  <b
                    v-if="overview.users[slotProps.data].all_time_change[0] == '-'"
                    style="color: var(--text-colour-negative)"
                  >
                    -£
                    {{ formatDecimal(overview.users[slotProps.data].all_time_change.slice(1)) }}
                  </b>
                  <b v-else style="color: var(--text-colour-positive)">
                    +£{{ formatDecimal(overview.users[slotProps.data].all_time_change) }}
                  </b>
                  <Divider layout="vertical" class="hdiv" />
                  <Divider layout="horizontal" class="vdiv" />
                  <span>{{
                    overview.users[slotProps.data].last_snapshot.toLocaleDateString()
                  }}</span>
                </div>
              </template>
            </Carousel>
          </template>
        </SummaryCard>
      </SummaryCards>
      <div class="graph-container">
        <PerformanceGraph id="" performance-type="portfolio" style="flex-grow: 1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container,
.overview {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.carousel-item {
  display: flex;
  justify-content: start;
  font-size: x-large;
}
.vdiv {
  display: none;
}
@media screen and (max-width: 650px) {
  .carousel-item {
    flex-direction: column;
  }
  .hdiv {
    display: none;
  }
  .vdiv {
    display: block;
  }
}
</style>
<style>
.graph-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin: var(--inline-spacing);
  background-color: var(--surface-card);
}
</style>
