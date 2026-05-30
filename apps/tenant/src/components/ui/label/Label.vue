<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label, type LabelProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Label
    :for="props.for"
    :class="
      cn(
        'text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
