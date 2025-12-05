<template>
    <div class="create-project-view">
        <div class="header-section">
            <button class="back-btn" @click="$router.back()">← Volver</button>
            <h2>Publicar Nuevo Proyecto</h2>
            <p class="subtitle">Define un reto real para identificar al mejor talento.</p>
        </div>

        <div class="form-card">
            <form @submit.prevent="handle_submit">

                <AppInputComponent id="title" v-model="form.title" label="Título del Proyecto"
                    placeholder="Ej: Desarrollo de MVP Fintech..." required />

                <div class="form-group">
                    <label class="form-label">Descripción del Reto</label>
                    <textarea v-model="form.description" rows="6" class="form-textarea"
                        placeholder="Describe el problema a resolver, el alcance y los entregables esperados..."
                        required></textarea>
                    <p class="hint">Sé detallado. Los mejores talentos buscan retos claros.</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Perfiles / Requisitos Técnicos</label>
                    <div class="tags-input-container">
                        <div class="tags-list">
                            <span v-for="(req, index) in form.requirements" :key="index" class="tag-pill">
                                {{ req }}
                                <button type="button" @click="remove_tag(index)" class="remove-tag">&times;</button>
                            </span>
                        </div>
                        <input type="text" v-model="new_tag" @keydown.enter.prevent="add_tag"
                            placeholder="Escribe un skill y presiona Enter (Ej: Node.js)" class="ghost-input" />
                    </div>
                    <p class="hint">Agrega tecnologías o roles necesarios (Ej: UX Design, Python, Marketing).</p>
                </div>

                <div class="actions">
                    <AppButtonComponent type="submit" :loading="projects_store.is_loading">
                        Publicar Proyecto
                    </AppButtonComponent>
                </div>

            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { use_projects_store } from '../../../../stores/projects-store';
import AppInputComponent from '../../../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../../../components/common/AppButtonComponent.vue';

const projects_store = use_projects_store();

const form = reactive({
    title: '',
    description: '',
    requirements: [] as string[]
});

const new_tag = ref('');

const add_tag = () => {
    const tag = new_tag.value.trim();
    if (tag && !form.requirements.includes(tag)) {
        form.requirements.push(tag);
    }
    new_tag.value = '';
};

const remove_tag = (index: number) => {
    form.requirements.splice(index, 1);
};

const handle_submit = async () => {
    // Validación manual simple
    if (form.requirements.length === 0) {
        alert('Por favor agrega al menos un requisito técnico.');
        return;
    }

    await projects_store.create_project(form);
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.create-project-view {
    max-width: 800px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2rem;

    .back-btn {
        color: $color-text-light;
        font-size: 0.9rem;
        margin-bottom: 1rem;

        &:hover {
            text-decoration: underline;
            color: $color-primary;
        }
    }

    h2 {
        margin-bottom: 0.5rem;
    }

    .subtitle {
        color: $color-text-light;
        margin: 0;
    }
}

.form-card {
    background: white;
    padding: 2rem;
    border-radius: $radius-md;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $color-text;
    font-size: 0.9rem;
}

.form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: $radius-md;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: $color-primary;
        box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
}

.hint {
    font-size: 0.8rem;
    color: $color-text-light;
    margin-top: 0.25rem;
}

/* TAGS INPUT STYLES */
.tags-input-container {
    border: 1px solid #d1d5db;
    border-radius: $radius-md;
    padding: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    background: white;
    min-height: 48px;

    &:focus-within {
        border-color: $color-primary;
        box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tag-pill {
    background-color: #e0e7ff;
    color: $color-primary;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.remove-tag {
    background: none;
    border: none;
    color: $color-primary;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;

    &:hover {
        color: shade($color-primary, 15%);
    }
}

.ghost-input {
    border: none;
    outline: none;
    flex: 1;
    min-width: 150px;
    font-size: 0.9rem;
    padding: 0.25rem;
}

.actions {
    margin-top: 2rem;
    text-align: right;
}
</style>