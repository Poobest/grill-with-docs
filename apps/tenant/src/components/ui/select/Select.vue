<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ChevronDown } from '@lucide/vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
const model = defineModel<string>();
</script>

<template>
  <div class="relative">
    <select
      v-model="model"
      :class="
        cn(
          'flex h-10 w-full appearance-none rounded-md border border-input bg-card px-3 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
    >
      <slot />
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
  </div>
</template>
