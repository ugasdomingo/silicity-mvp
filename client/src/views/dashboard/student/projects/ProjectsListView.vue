<template>
    <div class="projects-list">
        <div class="header-section">
            <h2>Proyectos Reales</h2>
            <p class="subtitle">Aplica tus conocimientos en retos de empresas y construye tu portafolio.</p>
        </div>

        <div v-if="projects_store.is_loading && projects_store.open_projects.length === 0" class="loading-state">
            Cargando proyectos...
        </div>

        <div v-else-if="projects_store.open_projects.length === 0" class="empty-state">
            <p>No hay proyectos abiertos en este momento. ¡Vuelve pronto!</p>
        </div>

        <div v-else class="projects-grid">
            <div v-for="project in projects_store.open_projects" :key="project._id" class="project-card">
                <div class="card-header">
                    <span class="company-name">🏢 {{ project.company_id?.name || 'Empresa Confidencial' }}</span>
                    <span class="status-badge">Abierto</span>
                </div>

                <h3>{{ project.title }}</h3>
                <p class="desc">{{ project.description }}</p>

                <div class="requirements">
                    <span v-for="req in project.requirements" :key="req" class="req-pill">{{ req }}</span>
                </div>

                <div class="actions">
                    <AppButtonComponent @click="open_apply_modal(project)">
                        🚀 Postularme
                    </AppButtonComponent>
                </div>
            </div>
        </div>

        <div v-if="show_modal" class="modal-overlay" @click.self="close_modal">
            <div class="modal-content">
                <h3>Postular a: {{ selected_project?.title }}</h3>
                <p class="modal-subtitle">Cuéntale a la empresa por qué eres el indicado para este reto.</p>

                <form @submit.prevent="handle_apply">

                    <div class="form-group">
                        <label class="form-label">Modo de participación</label>
                        <select v-model="form.mode" class="form-select">
                            <option value="solo">Individual (Asignadme a un equipo)</option>
                        </select>
                    </div>

                    <AppInputComponent id="role" v-model="form.desired_role" label="Rol que deseas desempeñar"
                        placeholder="Ej: Frontend Developer, UX Designer, PM..." required />

                    <div class="form-group">
                        <label class="form-label">Tu Pitch (Motivación)</label>
                        <textarea v-model="form.motivation" rows="4" class="form-textarea"
                            placeholder="Explica brevemente tu experiencia y por qué quieres participar en este proyecto..."
                            required></textarea>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" @click="close_modal">Cancelar</button>
                        <AppButtonComponent type="submit" :loading="projects_store.is_loading">
                            Enviar Postulación
                        </AppButtonComponent>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { use_projects_store } from '../../../../stores/projects-store';
import AppButtonComponent from '../../../../components/common/AppButtonComponent.vue';
import AppInputComponent from '../../../../components/common/AppInputComponent.vue';

const projects_store = use_projects_store();

const show_modal = ref(false);
const selected_project = ref<any>(null);

const form = reactive({
    mode: 'solo',
    desired_role: '',
    motivation: ''
});

onMounted(() => {
    projects_store.get_open_projects();
});

const open_apply_modal = (project: any) => {
    selected_project.value = project;
    // Reset form
    form.mode = 'solo';
    form.desired_role = '';
    form.motivation = '';
    show_modal.value = true;
};

const close_modal = () => {
    show_modal.value = false;
    selected_project.value = null;
};

const handle_apply = async () => {
    if (!selected_project.value) return;

    await projects_store.apply_to_project(selected_project.value._id, form);
    close_modal();
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.projects-list {
    max-width: 1200px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2rem;

    .subtitle {
        color: $color-text-light;
    }
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.project-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    }

    h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
        color: $color-text;
    }

    .desc {
        color: $color-text-light;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.85rem;

    .company-name {
        font-weight: 600;
        color: $color-primary;
    }

    .status-badge {
        background: #dcfce7;
        color: #166534;
        padding: 2px 8px;
        border-radius: 99px;
        font-weight: 600;
        font-size: 0.75rem;
    }
}

.requirements {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.req-pill {
    background: #f3f4f6;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
    color: #4b5563;
}

/* MODAL STYLES */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 1rem;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: $radius-lg;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    h3 {
        margin-bottom: 0.5rem;
        color: $color-primary;
    }

    .modal-subtitle {
        color: $color-text-light;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.form-select,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $radius-md;
    font-family: inherit;
    font-size: 1rem;
    background: white;

    &:focus {
        outline: none;
        border-color: $color-primary;
        box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-cancel {
    color: $color-text-light;
    font-weight: 600;

    &:hover {
        color: $color-text;
    }
}
</style>