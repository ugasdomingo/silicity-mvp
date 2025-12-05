<template>
    <div class="deliveries-view">
        <div class="header-section">
            <button class="back-btn" @click="$router.back()">← Volver a Proyectos</button>
            <h2>Entregas Recibidas</h2>
            <p class="subtitle">Revisa y evalúa el trabajo de los equipos.</p>
        </div>

        <div v-if="projects_store.is_loading" class="loading-state">
            Cargando entregas...
        </div>

        <div v-else-if="projects_store.current_deliveries.length === 0" class="empty-state">
            <p>Aún no hay entregas para este proyecto.</p>
        </div>

        <div v-else class="deliveries-grid">
            <div v-for="delivery in projects_store.current_deliveries" :key="delivery._id" class="delivery-card">

                <div class="card-header">
                    <div class="team-info">
                        <h3>👥 {{ delivery.group_id?.name || 'Equipo Desconocido' }}</h3>
                        <span class="date">Entregado: {{ format_date(delivery.submitted_at) }}</span>
                    </div>

                    <span class="status-badge" :class="delivery.company_evaluation.status">
                        {{ delivery.company_evaluation.status === 'reviewed' ? 'Evaluado' : 'Pendiente' }}
                    </span>
                </div>

                <div class="links-section">
                    <a :href="delivery.documentation_link" target="_blank" class="resource-link doc">
                        📄 Documentación
                    </a>
                    <a v-if="delivery.repo_link" :href="delivery.repo_link" target="_blank" class="resource-link repo">
                        💻 Repositorio
                    </a>
                    <a v-if="delivery.demo_link" :href="delivery.demo_link" target="_blank" class="resource-link demo">
                        🎥 Demo / Video
                    </a>
                </div>

                <div class="evaluation-section">

                    <div v-if="delivery.company_evaluation.status === 'reviewed'" class="review-summary">
                        <div class="rating-display" :class="delivery.company_evaluation.rating">
                            <strong>Calificación:</strong>
                            {{ translate_rating(delivery.company_evaluation.rating) }}
                        </div>
                        <p class="feedback-text">"{{ delivery.company_evaluation.feedback_text }}"</p>
                    </div>

                    <form v-else @submit.prevent="submit_evaluation(delivery._id)" class="eval-form">
                        <h4>Tu Evaluación</h4>

                        <div class="rating-selector">
                            <label class="rating-option positive"
                                :class="{ selected: forms[delivery._id]?.rating === 'positive' }">
                                <input type="radio" value="positive" v-model="forms[delivery._id].rating">
                                <span>🚀 Positivo</span>
                            </label>

                            <label class="rating-option improvable"
                                :class="{ selected: forms[delivery._id]?.rating === 'improvable' }">
                                <input type="radio" value="improvable" v-model="forms[delivery._id].rating">
                                <span>💡 Mejorable</span>
                            </label>

                            <label class="rating-option negative"
                                :class="{ selected: forms[delivery._id]?.rating === 'negative' }">
                                <input type="radio" value="negative" v-model="forms[delivery._id].rating">
                                <span>❌ Negativo</span>
                            </label>
                        </div>

                        <textarea v-model="forms[delivery._id].feedback"
                            placeholder="Escribe un feedback constructivo para el equipo..." rows="3"
                            required></textarea>

                        <div class="extra-options">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="forms[delivery._id].hiring_interested">
                                💼 Interés en contratar miembros
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="forms[delivery._id].ip_purchase">
                                💰 Interés en comprar IP
                            </label>
                        </div>

                        <AppButtonComponent type="submit" :loading="projects_store.is_loading">
                            Enviar Evaluación
                        </AppButtonComponent>
                    </form>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { use_projects_store } from '../../../../stores/projects-store';
import AppButtonComponent from '../../../../components/common/AppButtonComponent.vue';

const route = useRoute();
const projects_store = use_projects_store();
const project_id = route.params.id as string;

// Estado local para múltiples formularios (uno por tarjeta)
const forms = ref<Record<string, any>>({});

onMounted(async () => {
    await projects_store.get_project_deliveries(project_id);

    // Inicializar formularios para entregas pendientes
    projects_store.current_deliveries.forEach(d => {
        if (d.company_evaluation.status === 'pending') {
            forms.value[d._id] = {
                rating: 'positive', // Default
                feedback: '',
                hiring_interested: false,
                ip_purchase: false
            };
        }
    });
});

const submit_evaluation = async (delivery_id: string) => {
    const form_data = forms.value[delivery_id];

    await projects_store.evaluate_delivery(delivery_id, {
        rating: form_data.rating,
        feedback_text: form_data.feedback,
        hiring_interested: form_data.hiring_interested,
        ip_purchase_interested: form_data.ip_purchase
    });

    // Recargar para ver actualización
    await projects_store.get_project_deliveries(project_id);
};

const format_date = (date: string) => new Date(date).toLocaleDateString();

const translate_rating = (rating: string) => {
    const map: any = { 'positive': 'Positiva 🚀', 'improvable': 'Mejorable 💡', 'negative': 'Negativa ❌' };
    return map[rating] || rating;
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.deliveries-view {
    max-width: 900px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2rem;

    .back-btn {
        color: $color-text-light;
        font-size: 0.9rem;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }
}

.delivery-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;

    h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.2rem;
    }

    .date {
        font-size: 0.85rem;
        color: $color-text-light;
    }
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;

    &.pending {
        background: #fef3c7;
        color: #92400e;
    }

    &.reviewed {
        background: #dcfce7;
        color: #166534;
    }
}

.links-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.resource-link {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s;

    &.doc {
        background: #eff6ff;
        color: #1e40af;

        &:hover {
            background: #dbeafe;
        }
    }

    &.repo {
        background: #f3f4f6;
        color: #1f2937;

        &:hover {
            background: #e5e7eb;
        }
    }

    &.demo {
        background: #fdf2f8;
        color: #db2777;

        &:hover {
            background: #fce7f3;
        }
    }
}

/* --- ESTILOS DE EVALUACIÓN --- */
.eval-form {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px dashed #d1d5db;

    h4 {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-family: inherit;
    }
}

.rating-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.rating-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;

    input {
        display: none;
    }

    /* Ocultar radio real */

    /* Estados Seleccionados */
    &.positive.selected {
        background: #dcfce7;
        border-color: #166534;
        color: #166534;
        font-weight: 700;
    }

    &.improvable.selected {
        background: #fef3c7;
        border-color: #b45309;
        color: #b45309;
        font-weight: 700;
    }

    &.negative.selected {
        background: #fee2e2;
        border-color: #b91c1c;
        color: #b91c1c;
        font-weight: 700;
    }
}

.extra-options {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        cursor: pointer;
    }
}

/* Resumen Evaluado */
.review-summary {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 1rem;
    border-radius: 6px;

    .rating-display {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;

        &.positive {
            color: #166534;
        }

        &.improvable {
            color: #b45309;
        }

        &.negative {
            color: #b91c1c;
        }
    }

    .feedback-text {
        font-style: italic;
        color: #374151;
    }
}
</style>