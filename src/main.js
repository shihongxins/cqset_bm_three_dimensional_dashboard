import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import './assets/styles/basis.scss';
import './libs/unocss';

import './permission';
import { pinia } from './stores';

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
