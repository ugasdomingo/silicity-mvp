<template>
    <div class="groups-view">
        <div class="header-section">
            <div>
                <h2>Grupos de Estudio</h2>
                <p class="subtitle">Aprende en comunidad. Únete a un grupo o crea el tuyo.</p>
            </div>
            <AppButtonComponent v-if="can_interact" @click="show_create_modal = true">
                + Crear Grupo
            </AppButtonComponent>
            <AppButtonComponent v-else variant="secondary" @click="go_to_upgrade" title="Solo miembros Basic/Premium">
                🔒 Crear Grupo
            </AppButtonComponent>
        </div>

        <div v-if="show_create_modal" class="create-panel">
            <h3>Nuevo Grupo de Estudio</h3>
            <form @submit.prevent="handle_create" class="create-form">
                <AppInputComponent id="g-name" v-model="new_group.name" label="Nombre del Grupo"
                    placeholder="Ej: React Avanzado - Noches" required />

                <div class="form-row">
                    <AppInputComponent id="g-topic" v-model="new_group.topic" label="Tema Principal"
                        placeholder="Ej: Programación, Diseño, Inglés" required />
                </div>

                <div class="form-group">
                    <label>Descripción</label>
                    <textarea v-model="new_group.description" rows="3"
                        placeholder="¿Qué van a estudiar? ¿Cuál es el objetivo?" class="form-textarea"></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="cancel-btn" @click="show_create_modal = false">Cancelar</button>
                    <AppButtonComponent type="submit" :loading="groups_store.is_loading">
                        Crear Grupo
                    </AppButtonComponent>
                </div>
            </form>
        </div>

        <div v-if="groups_store.is_loading && !show_create_modal" class="loading-state">
            Cargando grupos...
        </div>

        <div v-else-if="groups_store.groups.length === 0" class="empty-state">
            <p>No hay grupos públicos activos aún. ¡Sé el primero en crear uno!</p>
        </div>

        <div v-else class="groups-grid">
            <div v-for="group in groups_store.groups" :key="group._id" class="group-card">
                <div class="card-header">
                    <span class="topic-tag">{{ group.topic }}</span>
                    <span class="members-count">👥 {{ group.members.length }}</span>
                </div>

                <h4>{{ group.name }}</h4>
                <p class="desc">{{ group.description || 'Sin descripción' }}</p>

                <div class="card-footer">
                    <AppButtonComponent v-if="is_member(group)" variant="primary" @click="go_to_chat(group._id)">
                        Entrar al Chat
                    </AppButtonComponent>

                    <template v-else>
                        <AppButtonComponent v-if="can_interact" variant="outline" @click="handle_join(group._id)"
                            :loading="joining_id === group._id">
                            Unirme al Grupo
                        </AppButtonComponent>

                        <AppButtonComponent v-else variant="secondary" @click="go_to_upgrade">
                            🔒 Unirme (Basic)
                        </AppButtonComponent>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { use_groups_store } from '../../../../stores/study-groups-store';
import { use_auth_store } from '../../../../stores/auth-store';
import AppButtonComponent from '../../../../components/common/AppButtonComponent.vue';
import AppInputComponent from '../../../../components/common/AppInputComponent.vue';

const groups_store = use_groups_store();
const auth_store = use_auth_store();
const router = useRouter();

const show_create_modal = ref(false);
const joining_id = ref<string | null>(null);

const new_group = reactive({
    name: '',
    topic: '',
    description: ''
});

// ✅ Computed para verificar si puede interactuar (Basic o superior)
const can_interact = computed(() => {
    const role = auth_store.user?.role;
    // Roles permitidos: student, talent, admin (company/vc no deberían estar aquí, pero user es el bloqueado)
    return ['student', 'talent', 'Admin'].includes(role || '');
});

const go_to_upgrade = () => {
    if (confirm('Esta función requiere una membresía Basic o superior. ¿Quieres ver los planes?')) {
        router.push({ name: 'payment-selection' });
    }
};

onMounted(() => {
    groups_store.fetch_groups();
});

const is_member = (group: any) => {
    const my_id = auth_store.user?._id;
    return group.members.some((m: any) => (m._id || m) === my_id);
};

const handle_create = async () => {
    await groups_store.create_group(new_group);
    show_create_modal.value = false;
    new_group.name = '';
    new_group.topic = '';
    new_group.description = '';
};

const handle_join = async (group_id: string) => {
    joining_id.value = group_id;
    await groups_store.join_group(group_id);
    joining_id.value = null;
};

const go_to_chat = (group_id: string) => {
    router.push({ name: 'group-chat', params: { id: group_id } });
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.groups-view {
    max-width: 1200px;
    margin: 0 auto;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    h2 {
        margin-bottom: 0.5rem;
    }

    .subtitle {
        color: $color-text-light;
        margin: 0;
    }
}

/* Panel de Creación */
.create-panel {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

    h3 {
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
    }
}

.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $radius-md;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 1rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.cancel-btn {
    color: $color-text-light;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
}

/* Grid de Grupos */
.groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.group-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    h4 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: $color-text;
    }

    .desc {
        font-size: 0.9rem;
        color: $color-text-light;
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
    margin-bottom: 1rem;
    font-size: 0.8rem;

    .topic-tag {
        background: #e0e7ff;
        color: $color-primary;
        padding: 2px 8px;
        border-radius: 99px;
        font-weight: 600;
    }

    .members-count {
        color: $color-text-light;
        font-weight: 500;
    }
}

.card-footer {
    margin-top: auto;
}
</style>