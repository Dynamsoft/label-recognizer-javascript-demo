import { createApp } from 'vue'
import App from './App.vue'
import { message, Dropdown, Menu, Popover, Spin } from 'ant-design-vue';
// import HomePage from './components/HomePage.vue';
// import RecognizerPage from './components/RecognizerPage.vue';
import { createRouter, createWebHistory } from 'vue-router'

//const publicPath = '/desktop/tfs/DemoAndSample/Online-Dev/label-recognizer-js-vue/dist/';

/* const routes = [
  {path: '/', component: HomePage},
  {path: '/mrz-scanner.html', component: RecognizerPage},
  {path: '/vin.html', component: RecognizerPage}
] */

const routes = [
  {path: '/', component: () => import('./components/HomePage.vue')},
  {path: '/mrz-scanner.html', component: () => import('./components/RecognizerPage.vue')},
  {path: '/vin.html', component: () => import('./components/RecognizerPage.vue')}
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

// document.dispatchEvent(new Event('render-event'));

app.config.globalProperties.$message = message;

app.config.globalProperties.$message.config({
  top: '20%',
  duration: 2,
  maxCount: 2
});

app.mount('#app');