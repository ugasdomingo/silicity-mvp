import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';

export const use_appointments_store = defineStore('appointments', () => {
    const appointments = ref<any[]>([]);
    const is_loading = ref(false);

    const fetch_my_appointments = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/appointments');
            appointments.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        appointments,
        is_loading,
        fetch_my_appointments
    };
});