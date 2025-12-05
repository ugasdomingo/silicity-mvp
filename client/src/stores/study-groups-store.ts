import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';
import { useRouter } from 'vue-router';

export const use_groups_store = defineStore('groups', () => {
    const groups = ref<any[]>([]);
    const current_group = ref<any>(null); // Para la vista de detalle/chat
    const is_loading = ref(false);

    const ui_store = use_ui_store();
    const router = useRouter();

    const fetch_groups = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/study-groups');
            groups.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const create_group = async (group_data: any) => {
        is_loading.value = true;
        try {
            const { data } = await api_client.post('/api/study-groups', group_data);
            ui_store.show_toast('Grupo creado', 'success');
            // Ir al chat del nuevo grupo
            router.push({ name: 'group-chat', params: { id: data.data._id } });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const join_group = async (id: string) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/study-groups/${id}/join`);
            ui_store.show_toast('Te has unido al grupo', 'success');
            await fetch_groups(); // Refrescar lista para actualizar UI de botones
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    // Acción para Networking (Graduar equipo)
    const graduate_team = async (id: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/study-groups/${id}/graduate`);
            ui_store.show_toast('¡Equipo graduado a Grupo Público!', 'success');
            // Refrescar datos del grupo actual si estamos dentro
            if (current_group.value && current_group.value._id === id) {
                current_group.value.status = 'open';
                current_group.value.visibility = 'public';
            }
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        groups,
        current_group,
        is_loading,
        fetch_groups,
        create_group,
        join_group,
        graduate_team
    };
});