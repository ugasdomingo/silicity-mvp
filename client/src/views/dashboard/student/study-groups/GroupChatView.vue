<template>
    <div class="chat-container">

        <div class="chat-header">
            <div class="group-info">
                <button class="back-btn" @click="$router.push({ name: 'study-groups-list' })">
                    ←
                </button>
                <div>
                    <h2>{{ current_group?.name || 'Cargando grupo...' }}</h2>
                    <span class="meta" v-if="current_group">
                        {{ current_group.members.length }} miembros • {{ current_group.topic }}
                    </span>
                </div>
            </div>

            <div class="actions">
                <button v-if="current_group?.is_project_team && current_group?.status === 'closed'" class="graduate-btn"
                    @click="handle_graduate" title="Abrir este equipo a la comunidad (Networking)">
                    🎓 Graduar Equipo
                </button>
            </div>
        </div>

        <div class="messages-area" ref="messages_container">
            <div v-if="messages.length === 0" class="empty-chat">
                <p>👋 ¡Saluda al grupo! Sé el primero en escribir.</p>
            </div>

            <div v-for="msg in messages" :key="msg._id || msg.tempId" class="message-row"
                :class="{ 'mine': is_mine(msg) }">
                <div class="avatar" v-if="!is_mine(msg)">
                    {{ get_initials(msg.user.name) }}
                </div>

                <div class="bubble">
                    <span class="sender-name" v-if="!is_mine(msg)">{{ msg.user.name }}</span>
                    <p>{{ msg.message }}</p>
                    <span class="time">{{ format_time(msg.created_at) }}</span>
                </div>
            </div>
        </div>

        <div class="typing-indicator" :class="{ active: is_typing }">
            <span>Alguien está escribiendo...</span>
            <div class="dots">
                <span>.</span><span>.</span><span>.</span>
            </div>
        </div>

        <div class="input-area">
            <input v-model="new_message" @keyup.enter="send" @input="emit_typing" placeholder="Escribe un mensaje..."
                type="text" autocomplete="off" />
            <button class="send-btn" @click="send" :disabled="!new_message.trim()">
                Enviar
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChat } from '../../../../composables/useChat';
import { use_auth_store } from '../../../../stores/auth-store';
import { use_groups_store } from '../../../../stores/study-groups-store';
import api_client from '../../../../api/axios-client';

const route = useRoute();
const router = useRouter();
const auth_store = use_auth_store();
const groups_store = use_groups_store();

const group_id = computed(() => route.params.id as string);
const current_group = ref<any>(null);
const messages_container = ref<HTMLElement | null>(null);
const new_message = ref('');

// Inicializar Composable de Chat
// NOTA: useChat ya maneja la conexión y desconexión en sus hooks
const { messages, is_typing, send_message, emit_typing } = useChat(group_id.value);

// Cargar datos del grupo (Nombre, miembros)
const load_group_info = async () => {
    try {
        const { data } = await api_client.get(`/api/study-groups/${group_id.value}`);
        current_group.value = data.data;
    } catch (error) {
        console.error('Error cargando grupo:', error);
        router.push({ name: 'dashboard' }); // Si falla (ej. 403), sacar al usuario
    }
};

const send = () => {
    if (!new_message.value.trim()) return;
    send_message(new_message.value);
    new_message.value = '';
};

const handle_graduate = async () => {
    if (confirm('¿Quieres abrir este equipo privado a toda la comunidad para hacer networking?')) {
        await groups_store.graduate_team(group_id.value);
        // Actualizar estado local
        current_group.value.status = 'open';
        current_group.value.visibility = 'public';
    }
};

// Helpers Visuales
const is_mine = (msg: any) => {
    return msg.user._id === auth_store.user?._id; // Comparamos IDs
};

const get_initials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

const format_time = (date_str: string) => {
    return new Date(date_str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Auto-scroll
const scroll_to_bottom = () => {
    nextTick(() => {
        if (messages_container.value) {
            messages_container.value.scrollTop = messages_container.value.scrollHeight;
        }
    });
};

// Observar nuevos mensajes para scrollear
watch(messages.value, () => {
    scroll_to_bottom();
}, { deep: true });

onMounted(async () => {
    await load_group_info();
    scroll_to_bottom();
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.chat-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px); // Ajustar según layout (header + padding)
    background: white;
    border-radius: $radius-md;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.chat-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;

    .group-info {
        display: flex;
        align-items: center;
        gap: 1rem;

        h2 {
            margin: 0;
            font-size: 1.1rem;
            color: $color-text;
        }

        .meta {
            font-size: 0.85rem;
            color: $color-text-light;
        }
    }

    .back-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: $color-text-light;

        &:hover {
            color: $color-primary;
        }
    }
}

.graduate-btn {
    background: linear-gradient(135deg, $color-primary 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba($color-primary, 0.3);
    }
}

.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.message-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    max-width: 70%;

    &.mine {
        align-self: flex-end;
        flex-direction: row-reverse;

        .bubble {
            background-color: $color-primary;
            color: white;
            border-bottom-right-radius: 2px;

            .sender-name {
                display: none;
            }

            .time {
                color: rgba(255, 255, 255, 0.8);
            }
        }

        .avatar {
            display: none;
        }

        // No mostrar mi propio avatar
    }

    &:not(.mine) .bubble {
        background-color: #f3f4f6;
        color: $color-text;
        border-bottom-left-radius: 2px;
    }
}

.avatar {
    width: 32px;
    height: 32px;
    background-color: #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: $color-text-light;
    flex-shrink: 0;
}

.bubble {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    position: relative;
    min-width: 120px;

    p {
        margin: 0;
        line-height: 1.4;
        word-wrap: break-word;
    }

    .sender-name {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: $color-primary;
    }

    .time {
        display: block;
        font-size: 0.65rem;
        text-align: right;
        margin-top: 0.25rem;
        color: $color-text-light;
    }
}

.typing-indicator {
    padding: 0.5rem 1.5rem;
    font-size: 0.8rem;
    color: $color-text-light;
    font-style: italic;
    height: 30px; // Espacio reservado
    opacity: 0;
    transition: opacity 0.2s;

    &.active {
        opacity: 1;
    }

    display: flex;
    align-items: center;
    gap: 4px;
}

.input-area {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 1rem;
    background: white;

    input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 99px;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
            border-color: $color-primary;
        }
    }

    .send-btn {
        background-color: $color-primary;
        color: white;
        border: none;
        padding: 0 1.5rem;
        border-radius: 99px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;

        &:disabled {
            background-color: #d1d5db;
            cursor: not-allowed;
        }

        &:hover:not(:disabled) {
            background-color: shade($color-primary, 10%);
        }
    }
}
</style>