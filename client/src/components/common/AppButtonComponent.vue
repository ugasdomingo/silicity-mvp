<script setup lang="ts">
defineProps<{
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline';
}>();
</script>

<template>
    <button :type="type || 'button'" class="btn" :class="[`btn--${variant || 'primary'}`, { 'btn--loading': loading }]"
        :disabled="disabled || loading">
        <span v-if="loading" class="loader"></span>
        <span v-else>
            <slot />
        </span>
    </button>
</template>

<style scoped lang="scss">
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: $radius-md;
    transition: all 0.2s;
    width: 100%; // Por defecto full width en MVP, ajustar según necesidad

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &--primary {
        background-color: $color-primary;
        color: white;

        &:hover:not(:disabled) {
            background-color: $color-primary-dark;
        }
    }

    &--secondary {
        background-color: $color-bg;
        color: $color-text;

        &:hover:not(:disabled) {
            background-color: #e5e7eb;
        }
    }
}

.loader {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>