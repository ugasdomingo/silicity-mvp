import axios from 'axios';
import { use_ui_store } from '../stores/ui-store';
import { use_auth_store } from '../stores/auth-store';

const api_client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
});

// Interceptor de Request
api_client.interceptors.request.use(
    (config) => {
        // Usamos el store dentro del interceptor para evitar referencias circulares iniciales
        const auth_store = use_auth_store();

        // El access_token vive en memoria en el store
        if (auth_store.access_token) {
            config.headers.Authorization = `Bearer ${auth_store.access_token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Response (Mantenemos la lógica de UI que ya aprobaste)
api_client.interceptors.response.use(
    (response) => {
        if (response.config.method !== 'get' && response.data?.message && response.data?.status === 'success' && response.data.message !== 'OK') {
            const ui_store = use_ui_store();
            ui_store.show_toast(response.data.message, 'success');
        }
        return response;
    },
    async (error) => {
        const ui_store = use_ui_store();
        const original_request = error.config;

        if (error.response) {
            const server_message = error.response.data?.message || 'Error desconocido';

            if (error.response.status === 500) {
                ui_store.show_toast('Ha ocurrido un error por favor intente más tarde', 'error');
            } else if (error.response.status === 401 && !original_request._retry) {
                // Lógica de refresh token pendiente para el siguiente paso, por ahora avisamos
                ui_store.show_toast('Sesión expirada', 'error');
                // Opcional: auth_store.logout();
            } else {
                ui_store.show_toast(server_message, 'error');
            }
        } else {
            ui_store.show_toast('Error de conexión con el servidor', 'error');
        }

        return Promise.reject(error);
    }
);

export default api_client;