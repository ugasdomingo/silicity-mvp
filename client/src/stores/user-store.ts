import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_auth_store } from './auth-store';
import { use_ui_store } from './ui-store';

export const use_user_store = defineStore('user', () => {
    // Estado
    const profile = ref<any>(null);
    const is_loading = ref(false);

    // Stores auxiliares
    const auth_store = use_auth_store();
    const ui_store = use_ui_store();

    // Acción: Obtener perfil completo
    const fetch_profile = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/users/me');
            profile.value = data.data;

            // Sincronizar datos básicos con auth store (por si cambió el nombre)
            if (auth_store.user) {
                auth_store.user.name = data.data.name;
                auth_store.user.role = data.data.role; // Por si hubo un upgrade manual
                auth_store.user.payment_status = data.data.payment_status;
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            is_loading.value = false;
        }
    };

    // Acción: Actualizar perfil (Patch)
    const update_profile = async (updates: any) => {
        is_loading.value = true;
        try {
            const { data } = await api_client.patch('/api/users/me', updates);
            profile.value = data.data; // Actualizamos el estado local con la respuesta
            ui_store.show_toast('Perfil actualizado correctamente', 'success');
        } catch (error) {
            // El error lo maneja el interceptor de Axios (ui-store)
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    // Acción: Marcar cita psicológica como agendada
    const mark_psych_scheduled = async () => {
        is_loading.value = true;
        try {
            await api_client.post('/api/users/schedule-psych');

            // Recargamos el perfil para que la UI actualice el banner de estado
            await fetch_profile();

            ui_store.show_toast('Cita registrada. ¡Éxito en tu evaluación!', 'success');
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        profile,
        is_loading,
        fetch_profile,
        update_profile,
        mark_psych_scheduled
    };
});