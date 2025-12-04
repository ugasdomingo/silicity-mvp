import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export const use_ui_store = defineStore('ui', () => {
    const toasts = ref<Toast[]>([]);
    let counter = 0;

    const show_toast = (message: string, type: ToastType = 'info') => {
        const id = counter++;
        toasts.value.push({ id, message, type });

        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            remove_toast(id);
        }, 4000);
    };

    const remove_toast = (id: number) => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    };

    return {
        toasts,
        show_toast,
        remove_toast
    };
});