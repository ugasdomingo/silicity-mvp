<template>
    <div class="admin-dashboard">
        <div class="header-section">
            <h2>Panel de Administración</h2>
            <p class="subtitle">Gestión de becas, usuarios y contenido.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Usuarios Registrados</span>
                <span class="value">0</span>
            </div>
            <div class="stat-card">
                <span class="label">Pendientes de Revisión</span>
                <span class="value">{{ scholarships_store.pending_applications.length }}</span>
            </div>
            <div class="stat-card">
                <span class="label">Becas Otorgadas para 2026</span>
                <span class="value">{{ scholarships_store.approved_applications | 0 }}/20</span>
            </div>
        </div>

        <div class="content-section">
            <div class="section-title">
                <h3>Postulaciones a Becas</h3>
                <button class="refresh-btn" @click="load_data" :disabled="scholarships_store.is_loading">
                    🔄 Recargar
                </button>
            </div>

            <div v-if="scholarships_store.is_loading" class="loading-state">
                Cargando datos...
            </div>

            <div v-else-if="scholarships_store.pending_applications.length === 0" class="empty-state">
                <p>✅ ¡Todo al día! No hay postulaciones pendientes.</p>
            </div>

            <div v-else class="applications-list">
                <div v-for="app in scholarships_store.pending_applications" :key="app._id" class="app-card">
                    <div class="app-header">
                        <div>
                            <h4>{{ app.user_id.name }}</h4>
                            <span class="email">{{ app.user_id.email }}</span>
                        </div>
                        <span class="badge">Beca: {{ app.scholarship_id.title }}</span>
                    </div>

                    <div class="app-body">
                        <div class="info-group">
                            <label>Motivación:</label>
                            <p>"{{ app.motivation }}"</p>
                        </div>

                        <div class="info-group" v-if="app.user_id.profile?.headline">
                            <label>Perfil:</label>
                            <p>{{ app.user_id.profile.headline }}</p>
                        </div>
                    </div>

                    <div class="app-actions">
                        <AppButtonComponent variant="secondary" @click="handle_evaluate(app, 'rejected')"
                            :loading="processing === app._id">
                            Rechazar (Con descuento)
                        </AppButtonComponent>

                        <AppButtonComponent variant="primary" @click="handle_evaluate(app, 'approved')"
                            :loading="processing === app._id">
                            ✅ Aprobar Beca
                        </AppButtonComponent>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { use_scholarships_store } from '../../../stores/scholarships-store';
import AppButtonComponent from '../../../components/common/AppButtonComponent.vue';

const scholarships_store = use_scholarships_store();
const processing = ref<string | null>(null); // ID de la app que se está procesando

const load_data = async () => {
    await scholarships_store.get_pending_applications();
    await scholarships_store.get_approved_applications();
};

const handle_evaluate = async (app: any, status: 'approved' | 'rejected') => {
    const confirm_msg = status === 'approved'
        ? `¿Seguro que quieres APROBAR la beca para ${app.user_id.name}? Esto enviará un email de confirmación.`
        : `¿Rechazar solicitud de ${app.user_id.name}? Se le enviará un email con el descuento del 60%.`;

    if (!window.confirm(confirm_msg)) return;

    processing.value = app._id;
    try {
        await scholarships_store.evaluate_application(app._id, status);
    } finally {
        processing.value = null;
    }
};

onMounted(() => {
    load_data();
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.admin-dashboard {
    max-width: 1000px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2rem;

    .subtitle {
        color: $color-text-light;
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;

    .label {
        font-size: 0.9rem;
        color: $color-text-light;
        margin-bottom: 0.5rem;
    }

    .value {
        font-size: 2rem;
        font-weight: 800;
        color: $color-primary;
    }
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
        margin: 0;
        font-size: 1.25rem;
    }

    .refresh-btn {
        font-size: 0.9rem;
        color: $color-primary;

        &:disabled {
            color: $color-text-light;
        }
    }
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: $radius-md;
    color: $color-text-light;
}

.applications-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.app-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;

    h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
    }

    .email {
        color: $color-text-light;
        font-size: 0.9rem;
    }

    .badge {
        background: #eff6ff;
        color: $color-primary;
        padding: 0.25rem 0.75rem;
        border-radius: 99px;
        font-size: 0.8rem;
        font-weight: 600;
    }
}

.app-body {
    margin-bottom: 1.5rem;

    .info-group {
        margin-bottom: 1rem;

        label {
            display: block;
            font-size: 0.8rem;
            font-weight: 700;
            color: $color-text-light;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
        }

        p {
            margin: 0;
            font-style: italic;
            color: #374151;
            line-height: 1.6;
        }
    }
}

.app-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}
</style>