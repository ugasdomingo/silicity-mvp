<template>
    <div class="talent-search">
        <div class="header-section">
            <h2>Buscador de Talento</h2>
            <p class="subtitle">Encuentra a los mejores profesionales para tu equipo.</p>
        </div>

        <div class="search-bar">
            <AppInputComponent id="skill-search" v-model="filters.skill"
                placeholder="Buscar por habilidad (ej: React, Python)..." @keyup.enter="handle_search" />
            <AppButtonComponent @click="handle_search" :loading="talent_store.is_loading">
                Buscar
            </AppButtonComponent>
        </div>

        <div v-if="talent_store.is_loading" class="loading-state">
            Buscando perfiles...
        </div>

        <div v-else class="results-container">

            <div v-if="applicants.length > 0" class="section applicants-section">
                <div class="section-header">
                    <h3>🔥 Interesados en tus proyectos</h3>
                    <span class="badge">{{ applicants.length }}</span>
                </div>
                <p class="section-desc">Estos usuarios ya han mostrado interés en tu empresa postulando a tus proyectos.
                </p>

                <div class="cards-grid">
                    <div v-for="talent in applicants" :key="talent._id" class="talent-card applicant-card">
                        <div class="card-top">
                            <div class="avatar-placeholder">{{ talent.name.charAt(0) }}</div>
                            <div class="info">
                                <h4>{{ talent.name }}</h4>
                                <span class="headline">{{ talent.headline }}</span>
                            </div>
                        </div>
                        <div class="skills-list">
                            <span v-for="skill in talent.skills.slice(0, 3)" :key="skill" class="skill-pill">{{ skill
                            }}</span>
                        </div>
                        <div class="actions">
                            <AppButtonComponent variant="primary" @click="open_interest_modal(talent)">
                                Contactar
                            </AppButtonComponent>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="global_showcase.length > 0" class="section showcase-section">
                <div class="section-header">
                    <h3>🏆 Vitrina Top Talent</h3>
                    <span class="badge gold">{{ global_showcase.length }}</span>
                </div>
                <p class="section-desc">Profesionales validados psicológicamente y con historial de éxito (+5
                    proyectos).</p>

                <div class="cards-grid">
                    <div v-for="talent in global_showcase" :key="talent._id" class="talent-card">
                        <div class="card-top">
                            <div class="avatar-placeholder">{{ talent.name.charAt(0) }}</div>
                            <div class="info">
                                <h4>{{ talent.name }}</h4>
                                <span class="headline">{{ talent.headline }}</span>
                            </div>
                        </div>
                        <div class="verified-badge">
                            🧠 Psicológicamente Validado
                        </div>
                        <div class="skills-list">
                            <span v-for="skill in talent.skills.slice(0, 3)" :key="skill" class="skill-pill">{{ skill
                            }}</span>
                        </div>
                        <div class="actions">
                            <AppButtonComponent variant="outline" @click="open_interest_modal(talent)">
                                Mostrar Interés
                            </AppButtonComponent>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="applicants.length === 0 && global_showcase.length === 0 && !talent_store.is_loading"
                class="empty-state">
                <p>No se encontraron talentos con esos criterios.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { use_talent_store } from '../../../stores/talent-store';
import AppInputComponent from '../../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../../components/common/AppButtonComponent.vue';

const talent_store = use_talent_store();
const filters = reactive({ skill: '' });

// Computed para separar listas
const applicants = computed(() => talent_store.talents.filter(t => t.is_applicant));
const global_showcase = computed(() => talent_store.talents.filter(t => !t.is_applicant && t.is_showcase));

const handle_search = () => {
    talent_store.search_talent(filters);
};

const open_interest_modal = async (talent: any) => {
    const message = prompt(`Enviar mensaje a ${talent.name}:`, "Hola, vimos tu perfil y nos gustaría invitarte a una entrevista.");
    if (message) {
        await talent_store.express_interest(talent._id, message);
    }
};

onMounted(() => {
    handle_search(); // Carga inicial
});
</script>

<style scoped lang="scss">
@use '../../../assets/scss/abstracts/variables' as *;

.talent-search {
    max-width: 1200px;
    margin: 0 auto;
}

.search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: flex-start;
}

.section {
    margin-bottom: 3rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;

    h3 {
        font-size: 1.5rem;
        margin: 0;
    }
}

.badge {
    background: #e0e7ff;
    color: $color-primary;
    padding: 0.2rem 0.8rem;
    border-radius: 99px;
    font-weight: 700;

    &.gold {
        background: #fef3c7;
        color: #d97706;
    }
}

.section-desc {
    color: $color-text-light;
    margin-bottom: 1.5rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.talent-card {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &.applicant-card {
        border-color: $color-primary;
        background: linear-gradient(to bottom right, white, #eef2ff);
    }
}

.card-top {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.avatar-placeholder {
    width: 48px;
    height: 48px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: $color-text-light;
}

.info {
    h4 {
        margin: 0;
        font-size: 1.1rem;
    }

    .headline {
        font-size: 0.85rem;
        color: $color-text-light;
    }
}

.verified-badge {
    font-size: 0.75rem;
    color: #059669;
    background: #d1fae5;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 1rem;
    display: inline-block;
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.skill-pill {
    font-size: 0.75rem;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 99px;
}
</style>