<template>
    <div class="profile-container">

        <div class="header-section">
            <h2>Mi Perfil {{ is_company_context ? 'Corporativo' : 'Profesional' }}</h2>
            <p class="subtitle">Gestiona cómo te ven en Silicity.</p>
        </div>

        <div v-if="user_store.is_loading && !user_store.profile" class="loading">Cargando...</div>

        <div v-else>

            <div v-if="show_psych_banner" class="psych-banner">
                <div class="psych-content">
                    <h3>🧠 Evaluación Psicológica Requerida</h3>
                    <p>
                        Has pagado tu membresía Talent, pero para activarla y ser visible ante empresas,
                        nuestra psicóloga colegiada debe validar tu perfil. Esto garantiza la calidad de nuestra
                        comunidad.
                    </p>

                    <div class="psych-actions" v-if="psych_status === 'pending_schedule'">
                        <a href="https://cal.com/tu-psicologa-silicity" target="_blank" class="btn-cal"
                            @click="handle_schedule_click">
                            📅 Agendar Cita (Cal.com)
                        </a>
                    </div>

                    <div v-else-if="psych_status === 'scheduled'" class="status-badge warning">
                        🕒 Cita Agendada - Esperando resultados
                    </div>

                    <div v-else-if="psych_status === 'failed'" class="status-badge danger">
                        ❌ No aprobado - Revisa tu correo para proceso de reembolso
                    </div>
                </div>
            </div>

            <form @submit.prevent="handle_save" class="profile-form">

                <div class="card">
                    <h3>Información General</h3>
                    <AppInputComponent id="name" v-model="form.name" label="Nombre (o Razón Social)" required />

                    <AppInputComponent v-if="!is_company_context" id="headline" v-model="form.profile.headline"
                        label="Titular Profesional" placeholder="Ej: Fullstack Developer | Vue & Node" />
                </div>

                <div v-if="is_company_context" class="card company-card">
                    <h3>Datos de la Empresa</h3>
                    <AppInputComponent id="website" v-model="form.company_info.website" label="Sitio Web"
                        placeholder="https://miempresa.com" />
                    <div class="form-group">
                        <label class="form-label">Sobre la Empresa</label>
                        <textarea v-model="form.company_info.description" rows="5" class="form-textarea"
                            placeholder="Cuéntanos tu misión, cultura y qué buscan..."></textarea>
                    </div>
                </div>

                <div v-else>
                    <div class="card">
                        <h3>Bio & Skills</h3>
                        <div class="form-group">
                            <label class="form-label">Elevator Pitch (Bio)</label>
                            <textarea v-model="form.profile.bio" rows="4" class="form-textarea"
                                placeholder="Resume quién eres y qué aportas en 3 líneas..."></textarea>
                        </div>
                        <AppInputComponent id="skills" v-model="skills_input"
                            label="Habilidades Clave (Separadas por comas)"
                            placeholder="Ej: React, Liderazgo, Inglés C1" />
                    </div>

                    <div class="card">
                        <h3>Presencia Digital</h3>
                        <AppInputComponent id="linkedin" v-model="form.profile.social_links.linkedin"
                            label="LinkedIn" />
                        <AppInputComponent id="github" v-model="form.profile.social_links.github" label="GitHub" />
                        <AppInputComponent id="portfolio" v-model="form.profile.social_links.portfolio"
                            label="Portafolio Web" />
                    </div>
                </div>

                <div class="actions">
                    <AppButtonComponent type="submit" :loading="user_store.is_loading">
                        Guardar Perfil
                    </AppButtonComponent>
                </div>

            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { use_user_store } from '../../stores/user-store';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';

const user_store = use_user_store();
const skills_input = ref('');

const form = reactive({
    name: '',
    profile: {
        headline: '',
        bio: '',
        social_links: { linkedin: '', github: '', portfolio: '' }
    },
    company_info: {
        description: '',
        website: ''
    }
});

// Detectar contexto
const is_company_context = computed(() => {
    const role = user_store.profile?.role;
    return ['company', 'vc'].includes(role);
});

// Lógica Psicológica
const psych_status = computed(() => user_store.profile?.psych_evaluation?.status);
const show_psych_banner = computed(() => {
    // Mostrar si no es empresa y el status es relevante (pendiente o fallido)
    return !is_company_context.value &&
        ['pending_schedule', 'scheduled', 'failed'].includes(psych_status.value);
});

onMounted(async () => {
    await user_store.fetch_profile();
    populate_form();
});

const populate_form = () => {
    if (user_store.profile) {
        const p = user_store.profile;
        form.name = p.name || '';

        // Talento
        if (p.profile) {
            form.profile.headline = p.profile.headline || '';
            form.profile.bio = p.profile.bio || '';
            if (p.profile.social_links) form.profile.social_links = { ...p.profile.social_links };
            if (p.profile.skills) skills_input.value = p.profile.skills.join(', ');
        }

        // Empresa
        if (p.company_info) {
            form.company_info.description = p.company_info.description || '';
            form.company_info.website = p.company_info.website || '';
        }
    }
};

const handle_save = () => {
    const updates: any = { name: form.name };

    if (is_company_context.value) {
        updates.company_info = form.company_info;
    } else {
        // Talento
        const skills_array = skills_input.value.split(',').map(s => s.trim()).filter(s => s);
        updates.profile = {
            ...form.profile,
            skills: skills_array
        };
    }

    user_store.update_profile(updates);
};

const handle_schedule_click = () => {
    // Al hacer clic en el link de Cal.com, avisamos al backend que ya agendó
    // para cambiar el estado a 'scheduled'
    user_store.mark_psych_scheduled();
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.profile-container {
    max-width: 800px;
    margin: 0 auto;
}

.subtitle {
    color: $color-text-light;
    margin-bottom: 2rem;
}

.card {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;

    h3 {
        color: $color-primary;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
}

// Banner Psicológico
.psych-banner {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: $radius-md;
    padding: 1.5rem;
    margin-bottom: 2rem;

    h3 {
        color: #1e40af;
        margin-bottom: 0.5rem;
    }

    p {
        color: #1e3a8a;
        margin-bottom: 1rem;
        font-size: 0.95rem;
    }
}

.btn-cal {
    display: inline-block;
    background-color: $color-primary;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: $radius-md;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
        background-color: $color-primary-dark;
    }
}

.status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 600;

    &.warning {
        background: #fef3c7;
        color: #92400e;
    }

    &.danger {
        background: #fee2e2;
        color: #b91c1c;
    }
}

.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $radius-md;
    font-family: inherit;
    resize: vertical;
}

.form-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.actions {
    text-align: right;
}
</style>