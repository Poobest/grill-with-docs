<script setup lang="ts">
import { CheckCircle2, AlertCircle, X } from '@lucide/vue';
import { useToast } from '@/lib/toast';

const { toasts, dismiss } = useToast();
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="pointer-events-auto flex w-80 items-start gap-2.5 rounded-md border bg-card p-3 shadow-lg"
    >
      <CheckCircle2
        v-if="t.variant === 'success'"
        class="mt-0.5 size-4 shrink-0 text-status-success"
      />
      <AlertCircle v-else class="mt-0.5 size-4 shrink-0 text-status-danger" />
      <p class="flex-1 text-sm font-semibold leading-snug">{{ t.message }}</p>
      <button
        type="button"
        aria-label="ปิด"
        class="text-muted-foreground hover:text-foreground"
        @click="dismiss(t.id)"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
