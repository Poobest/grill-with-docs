import { ref } from 'vue';

export type ToastVariant = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const toasts = ref<Toast[]>([]);
let counter = 0;

const AUTO_DISMISS_MS = 4500;

/** Minimal app-wide toast store (no external dependency). */
export function useToast() {
  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function show(message: string, variant: ToastVariant = 'success'): void {
    const id = ++counter;
    toasts.value = [...toasts.value, { id, message, variant }];
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }

  return { toasts, show, dismiss };
}
