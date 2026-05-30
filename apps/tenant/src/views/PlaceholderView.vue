<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Construction } from '@lucide/vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const route = useRoute()
const title = (route.meta.title as string) ?? 'หน้านี้'
</script>

<template>
  <PageHeader :title="title" />
  <div class="flex flex-col items-center justify-center gap-2 px-6 py-24 text-center">
    <Construction class="size-10 text-muted-foreground" />
    <p class="font-semibold">ยังไม่ได้พัฒนาส่วนนี้</p>
    <p class="max-w-sm text-xs text-muted-foreground">
      “{{ title }}” อยู่ในแผนพัฒนา slice ถัดไป — ตอนนี้แสดงเป็นตัวอย่างโครงหน้าจอตาม design system
    </p>
  </div>
</template>
