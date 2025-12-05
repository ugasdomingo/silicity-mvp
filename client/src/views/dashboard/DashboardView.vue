<script setup lang="ts">
import { computed } from 'vue';
import { use_auth_store } from '../../stores/auth-store';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';
import { Sparkles, AlertTriangle } from 'lucide-vue-next'; // Importamos iconos

const auth_store = use_auth_store();

const user = computed(() => auth_store.user);
const user_role = computed(() => user.value?.role);
const payment_status = computed(() => user.value?.payment_status);

// Determinar qué banner mostrar
const show_early_adopter = computed(() =>
    ['company', 'vc'].includes(user_role.value || '') && payment_status.value === 'free_trial'
);

const show_pending_payment = computed(() =>
    payment_status.value === 'pending' // Pago offline en revisión
);

const has_access = (required_role: string) => {
    // Lógica de permisos visuales (simplificada para MVP)
    if (['Admin', 'company', 'vc'].includes(user_role.value || '')) return true;

    const roles_hierarchy = ['user', 'student', 'talent'];
    const user_level = roles_hierarchy.indexOf(user_role.value || 'user');
    const req_level = roles_hierarchy.indexOf(required_role);

    return user_level >= req_level && payment_status.value === 'active';
};
</script>

<template>
    <div>
        <div class="welcome-header">
            <h2>Panel de Control</h2>
            <span class="role-badge">{{ user_role }}</span>
        </div>

        <div v-if="show_early_adopter" class="banner early-adopter">
            <div class="icon">
                <Sparkles />
            </div>
            <div class="content">
                <h3>¡Bienvenido Aliado Early Adopter! 🚀</h3>
                <p>
                    Gracias por confiar en Silicity en nuestra etapa inicial.
                    Disfruta de tu <strong>Membresía Anual Gratuita</strong>.
                    Puedes crear 1 proyecto este trimestre y acceder a la búsqueda de talento.
                </p>
            </div>
        </div>

        <div v-if="show_pending_payment" class="banner warning">
            <div class="icon">
                <AlertTriangle />
            </div>
            <div class="content">
                <h3>Pago en Revisión</h3>
                <p>Hemos recibido tu reporte de pago. Un administrador lo validará pronto.</p>
            </div>
        </div>

        <div class="dashboard-grid">

            <template v-if="['company', 'vc'].includes(user_role)">
                <div class="card action-card">
                    <h3>📢 Publicar Proyecto</h3>
                    <p>Lanza un reto real para encontrar talento.</p>
                    <AppButtonComponent @click="$router.push('/app/projects/create')">
                        Crear Nuevo Proyecto
                    </AppButtonComponent>
                </div>

                <div class="card">
                    <h3>🔍 Buscar Talento</h3>
                    <p>Explora perfiles validados.</p>
                    <AppButtonComponent variant="secondary" @click="$router.push('/app/talent-search')">
                        Ir a la Vitrina
                    </AppButtonComponent>
                </div>
            </template>

            <template v-else>
                <div class="card">
                    <h3>📢 Novedades</h3>
                    <p>Bienvenido a la comunidad Silicity.</p>
                </div>

                <div class="card">
                    <h3>🎓 Becas</h3>
                    <p>Explora oportunidades educativas.</p>
                    <AppButtonComponent variant="outline" @click="$router.push({ name: 'scholarships' })">
                        Ver Disponibles
                    </AppButtonComponent>
                </div>

                <div class="card">
                    <h3>💼 Proyectos</h3>
                    <p>Participa en retos reales de empresas.</p>
                    <AppButtonComponent variant="outline" @click="$router.push({ name: 'projects-list' })">
                        Ver Tablón
                    </AppButtonComponent>
                </div>

                <div class="card">
                    <h3>👥 Comunidad</h3>
                    <p>Únete a grupos de estudio.</p>
                    <AppButtonComponent variant="outline" @click="$router.push({ name: 'study-groups-list' })">
                        Explorar Grupos
                    </AppButtonComponent>
                </div>

                <div v-if="has_access('student')" class="card">
                    <h3>🎓 Mis Becas</h3>
                    <p>Gestiona tus postulaciones.</p>
                    <AppButtonComponent variant="outline" @click="$router.push('/app/scholarships')">Ver Becas
                    </AppButtonComponent>
                </div>

                <div v-if="user_role === 'user' || payment_status === 'unpaid'" class="card highlight">
                    <h3>⭐ Sube de Nivel</h3>
                    <p>Desbloquea becas y proyectos reales.</p>
                    <AppButtonComponent @click="$router.push('/payment-selection')">
                        Ver Planes
                    </AppButtonComponent>
                </div>
            </template>

        </div>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.welcome-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.role-badge {
    padding: 0.25rem 0.75rem;
    background-color: #e0e7ff;
    color: $color-primary;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
}

// BANNERS
.banner {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: $radius-md;
    margin-bottom: 2rem;

    .icon {
        display: flex;
        align-items: flex-start;
        margin-top: 2px;
    }

    h3 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    p {
        font-size: 0.95rem;
        margin: 0;
        line-height: 1.5;
    }

    &.early-adopter {
        background-color: #f0fdf4; // Verde muy claro
        border: 1px solid #bbf7d0;
        color: #166534;

        .icon {
            color: #166534;
        }
    }

    &.warning {
        background-color: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;

        .icon {
            color: #f59e0b;
        }
    }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.card {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    h3 {
        margin-bottom: 0.5rem;
        font-size: 1.25rem;
        color: $color-text;
    }

    p {
        color: $color-text-light;
        margin-bottom: 1.5rem;
    }

    &.highlight {
        border: 2px solid $color-primary;
        background-color: rgba($color-primary, 0.02);
    }
}
</style>