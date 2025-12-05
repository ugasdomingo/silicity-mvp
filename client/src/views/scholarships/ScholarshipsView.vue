<template>
    <div>
        <div class="header-section">
            <h2>Becas y Beneficios</h2>
            <p>Oportunidades exclusivas para impulsar tu carrera.</p>
        </div>

        <div v-if="scholarships_store.is_loading" class="loading">Cargando oportunidades...</div>

        <div v-else class="grid-container">
            <div v-for="beca in scholarships_store.scholarships" :key="beca._id" class="beca-card"
                :class="{ 'instant-card': beca.auto_approve }">
                <div class="card-header">
                    <span class="provider-tag">{{ beca.provider }}</span>
                    <span v-if="!beca.auto_approve" class="deadline-tag">Cierra: {{ format_date(beca.deadline) }}</span>
                    <span v-else class="instant-tag">⚡ Aprobación Inmediata</span>
                </div>

                <h3>{{ beca.title }}</h3>
                <p class="desc">{{ beca.description }}</p>

                <div class="requirements">
                    <span v-for="req in beca.requirements" :key="req" class="req-pill">{{ req }}</span>
                </div>

                <div class="card-footer">
                    <AppButtonComponent v-if="can_apply" @click="handle_apply(beca)"
                        :variant="beca.auto_approve ? 'primary' : 'outline'">
                        {{ beca.auto_approve ? 'Obtener Beneficio Ahora' : 'Postularme' }}
                    </AppButtonComponent>

                    <AppButtonComponent v-else variant="secondary" class="locked-btn" @click="go_to_upgrade">
                        🔒 Desbloquear (Premium)
                    </AppButtonComponent>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { use_scholarships_store } from '../../stores/scholarships-store';
import { use_auth_store } from '../../stores/auth-store';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';

const router = useRouter();
const scholarships_store = use_scholarships_store();
const auth_store = use_auth_store();

onMounted(() => {
    scholarships_store.get_all_scholarships();
});

const can_apply = computed(() => {
    const user = auth_store.user;
    if (!user) return false;
    return user.payment_status === 'active' || user.payment_status === 'free_trial';
});

const format_date = (date_string: string) => {
    return new Date(date_string).toLocaleDateString();
};

const handle_apply = async (beca: any) => {
    let motivation = '';

    // Solo pedimos motivación si NO es automática
    if (!beca.auto_approve) {
        const input = prompt(`Esta beca requiere aprobación manual.\n\n¿Por qué quieres aplicar a "${beca.title}"?`);
        if (!input) return; // Si cancela, no hacemos nada
        motivation = input;
    } else {
        // Confirmación simple para las automáticas
        const confirm = window.confirm(`Vas a activar el beneficio "${beca.title}".\n\n¿Confirmar activación inmediata?`);
        if (!confirm) return;
    }

    // Llamada al store
    try {
        await scholarships_store.apply_to_scholarship(beca._id, motivation);
    } catch (e) {
        // Error manejado en store/interceptor
    }
};

const go_to_upgrade = () => {
    router.push({ name: 'payment-selection' });
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.header-section {
    margin-bottom: 2rem;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.beca-card {
    background: white;
    border-radius: $radius-md;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
    border: 1px solid transparent;

    &:hover {
        transform: translateY(-3px);
    }

    // Estilo especial para las "Instantáneas"
    &.instant-card {
        border-color: rgba($color-success, 0.3);
        background: linear-gradient(to bottom right, white, #f0fdf4); // Sutil verde
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.8rem;
}

.provider-tag {
    font-weight: 700;
    color: $color-primary;
}

.deadline-tag {
    color: $color-text-light;
}

.instant-tag {
    color: $color-success;
    font-weight: 700;
    background: #dcfce7;
    padding: 2px 6px;
    border-radius: 4px;
}

h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.desc {
    font-size: 0.9rem;
    color: $color-text-light;
    margin-bottom: 1rem;
    flex: 1;
}

.requirements {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.req-pill {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
}

.locked-btn {
    border: 1px solid $color-warning;
    color: darken($color-warning, 10%);
}
</style>