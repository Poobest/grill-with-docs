<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header
    class="flex h-14 items-center justify-between gap-4 border-b bg-card px-6"
  >
    <div class="min-w-0">
      <h1 class="truncate text-xl font-semibold leading-tight tracking-tight">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="truncate text-xs text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>
    <!-- Primary action slot — UI-SPEC rule: at most one accent action per view -->
    <div class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
