<script setup lang="ts">
import PublicNavbar from './PublicNavbar.vue';
import FooterComponent from './FooterComponent.vue';
</script>

<template>
    <div class="public-layout">
        <PublicNavbar />

        <main class="content">
            <router-view />
        </main>

        <FooterComponent />
    </div>
</template>

<style scoped lang="scss">
.public-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>