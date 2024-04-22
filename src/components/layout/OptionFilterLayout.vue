<script setup lang="ts">

</script>

<template>
    <div class="container">
        <div class="header">
            <slot name="header"></slot>
        </div>
        <div class="card">
            <slot name="options"></slot>
        </div>
        <div class="body-section">
            <div class="card filter">
                <slot name="filter"></slot>
            </div>
            <div class="card body">
                <slot name="body"></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
}

.card {
    border: 1px solid var(--border-colour);
    border-radius: 6px;
    padding: 1rem;
}

.body-section {
    display: grid;
    grid-template-columns: 20rem minmax(0, 1fr);
    grid-column-gap: 2rem;
}

.filter {
    grid-column: 1;
}

.body {
    grid-column: 2;
    max-width: 100%;
}

@media screen and (max-width: 910px) {

    .body-section {
        display: grid;
        grid-template-rows: auto auto;
        grid-template-columns: auto;
        grid-row-gap: 2rem;
    }

    .filter {
        grid-row: 1;
        grid-column: 1;
    }

    .body {
        grid-row: 2;
        grid-column: 1;
    }

    .card {
        overflow-x: scroll;
    }

}
</style>
