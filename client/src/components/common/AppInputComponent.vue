<script setup lang="ts">
defineProps<{
    modelValue: string | number;
    label?: string;
    type?: string;
    placeholder?: string;
    id: string;
    required?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const update_value = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};
</script>

<template>
    <div class="form-group">
        <label v-if="label" :for="id" class="form-label">
            {{ label }} <span v-if="required" class="required">*</span>
        </label>
        <input :id="id" :type="type || 'text'" :value="modelValue" :placeholder="placeholder" class="form-input"
            @input="update_value" :required="required" />
    </div>
</template>

<style scoped lang="scss">
.form-group {
    margin-bottom: $spacing-md;
}

.form-label {
    display: block;
    font-weight: 500;
    margin-bottom: $spacing-xs;
    color: $color-text;
    font-size: 0.9rem;
}

.required {
    color: $color-danger;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db; // Gray 300
    border-radius: $radius-md;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
        outline: none;
        border-color: $color-primary;
        box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
}
</style>