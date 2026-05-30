<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  colspan?: number
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr>
    <td
      :colspan="props.colspan ?? 1"
      :class="cn('p-0', props.class)"
    >
      <div class="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
        <slot />
      </div>
    </td>
  </tr>
</template>
