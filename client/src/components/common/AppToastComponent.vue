<script setup lang="ts">
import { use_ui_store } from '../../stores/ui-store';

const ui_store = use_ui_store();
</script>

<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in ui_store.toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
                <span>{{ toast.message }}</span>
                <button @click="ui_store.remove_toast(toast.id)" class="toast__close">&times;</button>
            </div>
        </transition-group>
    </div>
</template>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    min-width: 300px;
    padding: 1rem;
    border-radius: $radius-md;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-weight: 500;

    &--success {
        background-color: $color-success;
    }

    &--error {
        background-color: $color-danger;
    }

    &--info {
        background-color: $color-primary;
    }

    &__close {
        color: white;
        font-size: 1.2rem;
        margin-left: 10px;
        opacity: 0.7;

        &:hover {
            opacity: 1;
        }
    }
}

// Animaciones de Vue
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>