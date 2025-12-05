<template>
    <div class="appointments-view">
        <div class="header-section">
            <h2>Mi Acompañamiento</h2>
            <p class="subtitle">Agenda tus sesiones con Lucía y revisa tu historial.</p>
        </div>

        <div class="content-grid">

            <div class="scheduler-card">

                <div class="type-selector">
                    <button class="type-tab" :class="{ active: selected_type === 'orientation' }"
                        @click="selected_type = 'orientation'">
                        🧭 Orientación Vocacional
                    </button>

                    <button v-if="can_see_psych" class="type-tab" :class="{ active: selected_type === 'psych' }"
                        @click="selected_type = 'psych'">
                        🧠 Valoración Psicológica
                    </button>
                </div>

                <div class="card-body">
                    <h3>{{ current_title }}</h3>
                    <p class="card-desc">{{ current_desc }}</p>

                    <div v-show="selected_type === 'orientation'"
                        style="width:100%;height:100%;overflow:scroll;min-height:550px"
                        id="my-cal-inline-orientacion-vocacional"></div>

                    <div v-if="can_see_psych" v-show="selected_type === 'psych'"
                        style="width:100%;height:100%;overflow:scroll;min-height:550px"
                        id="my-cal-inline-valoracion-psicologica"></div>

                </div>
            </div>

            <div class="history-card">
                <div class="history-header">
                    <h3>Mis Citas</h3>
                    <button class="refresh-btn" @click="appointments_store.fetch_my_appointments"
                        :disabled="appointments_store.is_loading">
                        🔄
                    </button>
                </div>

                <div v-if="appointments_store.is_loading" class="loading-state">
                    Cargando citas...
                </div>

                <div v-else-if="appointments_store.appointments.length === 0" class="empty-state">
                    <p>No tienes citas registradas aún.</p>
                </div>

                <div v-else class="appointments-list">
                    <div v-for="appt in appointments_store.appointments" :key="appt._id" class="appt-item"
                        :class="appt.status">
                        <div class="date-box">
                            <span class="day">{{ get_day(appt.start_time) }}</span>
                            <span class="month">{{ get_month(appt.start_time) }}</span>
                        </div>
                        <div class="details">
                            <h4>{{ get_type_label(appt.type) }}</h4>
                            <span class="time">🕒 {{ format_time(appt.start_time) }}</span>
                            <span class="status-pill" :class="appt.status">{{ translate_status(appt.status) }}</span>
                        </div>
                        <a v-if="appt.meeting_url && appt.status === 'scheduled'" :href="appt.meeting_url"
                            target="_blank" class="join-btn">
                            Unirse
                        </a>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { use_appointments_store } from '../../../../stores/appointments-store';
import { use_auth_store } from '../../../../stores/auth-store';

const appointments_store = use_appointments_store();
const auth_store = use_auth_store();

const selected_type = ref<'orientation' | 'psych'>('orientation');

// Permisos
const can_see_psych = computed(() => {
    return ['talent', 'admin'].includes(auth_store.user?.role || '');
});

const current_title = computed(() =>
    selected_type.value === 'orientation' ? 'Agendar Orientación' : 'Agendar Valoración'
);

const current_desc = computed(() =>
    selected_type.value === 'orientation'
        ? 'Sesión para definir tu ruta.'
        : 'Evaluación profesional de competencias.'
);

// --- INTEGRACIÓN CAL.COM ---

const init_cal = () => {
    // 1. Snippet Base (Carga el script globalmente)
    (function (C: any, A: string, L: string) {
        let p = function (a: any, ar: any) { a.q.push(ar); };
        let d = C.document;
        C.Cal = C.Cal || function () {
            let cal = C.Cal;
            let ar = arguments;
            if (!cal.loaded) {
                cal.ns = {};
                cal.q = cal.q || [];
                d.head.appendChild(d.createElement("script")).src = A;
                cal.loaded = true;
            }
            if (ar[0] === L) {
                // ✅ CORRECCIÓN AQUÍ: Tipado explícito 'any' para evitar error TS7022
                const api: any = function () { p(api, arguments); };
                const namespace = ar[1];
                api.q = api.q || [];
                if (typeof namespace === "string") {
                    cal.ns[namespace] = cal.ns[namespace] || api;
                    p(cal.ns[namespace], ar);
                    p(cal, ["initNamespace", namespace]);
                } else p(cal, ar);
                return;
            }
            p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;

    // 2. Inicializar Orientación (Siempre visible)
    Cal("init", "orientacion-vocacional", { origin: "https://app.cal.com" });

    Cal.ns["orientacion-vocacional"]("inline", {
        elementOrSelector: "#my-cal-inline-orientacion-vocacional",
        config: { "layout": "month_view" },
        calLink: "silicity/orientacion-vocacional",
        // Inyectamos datos del usuario para autocompletar
        name: auth_store.user?.name,
        email: auth_store.user?.email
    });

    Cal.ns["orientacion-vocacional"]("ui", {
        "hideEventTypeDetails": false,
        "layout": "month_view"
    });

    // 3. Inicializar Valoración (Solo si es talento)
    if (can_see_psych.value) {
        Cal("init", "valoracion-psicologica", { origin: "https://app.cal.com" });

        Cal.ns["valoracion-psicologica"]("inline", {
            elementOrSelector: "#my-cal-inline-valoracion-psicologica",
            config: { "layout": "month_view" },
            calLink: "silicity/valoracion-psicologica",
            name: auth_store.user?.name,
            email: auth_store.user?.email
        });

        Cal.ns["valoracion-psicologica"]("ui", {
            "hideEventTypeDetails": false,
            "layout": "month_view"
        });
    }
};

onMounted(() => {
    appointments_store.fetch_my_appointments();
    // Iniciamos Cal.com
    init_cal();
});

// Helpers
const get_day = (date: string) => new Date(date).getDate();
const get_month = (date: string) => new Date(date).toLocaleDateString('es-ES', { month: 'short' });
const format_time = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const get_type_label = (type: string) => type === 'psych_evaluation' ? 'Valoración Psicológica' : 'Orientación Vocacional';

const translate_status = (status: string) => {
    const map: any = { 'scheduled': 'Programada', 'completed': 'Completada', 'cancelled': 'Cancelada' };
    return map[status] || status;
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.appointments-view {
    max-width: 1200px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2rem;

    .subtitle {
        color: $color-text-light;
    }
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 992px) {
        grid-template-columns: 2fr 1fr;
    }
}

.scheduler-card {
    background: white;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    min-height: 650px;
    /* Altura suficiente para el iframe */
}

.type-selector {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.type-tab {
    flex: 1;
    padding: 1rem;
    border: none;
    background: none;
    font-weight: 600;
    color: $color-text-light;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;

    &:hover {
        background: rgba(0, 0, 0, 0.02);
        color: $color-primary;
    }

    &.active {
        color: $color-primary;
        border-bottom-color: $color-primary;
        background: white;
    }
}

.card-body {
    padding: 1.5rem;

    h3 {
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }

    .card-desc {
        color: $color-text-light;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }
}

/* HISTORIAL */
.history-card {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;
    height: fit-content;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .refresh-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;

        &:hover {
            transform: rotate(180deg);
            transition: 0.3s;
        }
    }
}

.appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.appt-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid transparent;

    &.scheduled {
        border-left-color: $color-primary;
        background: #eff6ff;
    }

    &.completed {
        border-left-color: $color-success;
    }

    &.cancelled {
        border-left-color: $color-text-light;
        opacity: 0.7;
    }
}

.date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 0.5rem;
    border-radius: 6px;
    min-width: 50px;

    .day {
        font-size: 1.2rem;
        font-weight: 800;
        color: $color-text;
    }

    .month {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: $color-text-light;
    }
}

.details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h4 {
        margin: 0;
        font-size: 0.95rem;
    }

    .time {
        font-size: 0.85rem;
        color: $color-text-light;
    }
}

.status-pill {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;

    &.scheduled {
        color: $color-primary;
    }
}

.join-btn {
    background: $color-primary;
    color: white;
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
}
</style>