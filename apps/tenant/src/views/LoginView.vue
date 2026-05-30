<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const router = useRouter();
const auth = useAuthStore();

const email = ref('sale@demo.local');
const password = ref('password123');
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    await router.push('/');
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <div
          class="mb-1 flex size-9 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground"
        >
          ผ
        </div>
        <CardTitle>เข้าสู่ระบบผ่อนชำระ</CardTitle>
        <CardDescription>กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div class="flex flex-col gap-1.5">
            <Label for="email">อีเมล</Label>
            <Input id="email" v-model="email" type="email" placeholder="you@example.com" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="password">รหัสผ่าน</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" />
          </div>

          <p v-if="error" class="text-xs font-semibold text-destructive">
            {{ error }}
          </p>

          <Button type="submit" :disabled="loading" class="mt-1 w-full">
            {{ loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
