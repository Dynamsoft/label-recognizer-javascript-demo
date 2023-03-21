import { createApp } from 'vue'
import App from './App.vue'
import { message, Dropdown, Menu, Popover, Spin } from 'ant-design-vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createGtm } from '@gtm-support/vue-gtm';

const routes = [
  { path: '/', component: () => import('./views/HomePage.vue') },
  { path: '/mrz-scanner.html', component: () => import('./views/RecognizerPage.vue') },
  { path: '/vin.html', component: () => import('./views/RecognizerPage.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const app = createApp(App);

app.use(router);
app.use(Dropdown);
app.use(Menu);
app.use(Popover);
app.use(Spin);

app.config.globalProperties.$message = message;

app.config.globalProperties.$message.config({
  top: '20%',
  duration: 2,
  maxCount: 2
});

app.mount('#app');