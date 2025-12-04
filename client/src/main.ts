import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createUnhead } from '@unhead/vue';
import App from './App.vue';
import router from './router';

// Importar estilos globales SASS
import './assets/scss/main.scss';

const app = createApp(App);

// Inicializar plugins
app.use(createPinia());
app.use(router);
app.use(createUnhead()); // SEO Management

app.mount('#app');
