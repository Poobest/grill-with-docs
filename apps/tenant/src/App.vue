<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import ToastHost from '@/components/layout/ToastHost.vue';

const route = useRoute();
// Public routes (login) render full-screen without the app shell.
const showShell = computed(() => !route.meta.public);
</script>

<template>
  <div v-if="showShell" class="flex min-h-screen bg-background">
    <AppSidebar />
    <main class="flex-1 overflow-x-hidden">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
  <ToastHost />
</template>
