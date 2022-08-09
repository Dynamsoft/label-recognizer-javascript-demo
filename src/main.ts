import { createApp } from 'vue'
import App from './App.vue'
import { message, Dropdown, Menu, Popover, Spin } from 'ant-design-vue';
// import HomePage from './components/HomePage.vue';
// import RecognizerPage from './components/RecognizerPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createGtm } from '@gtm-support/vue-gtm';

//const publicPath = '/desktop/tfs/DemoAndSample/Online-Dev/label-recognizer-js-vue/dist/';

/* const routes = [
  {path: '/', component: HomePage},
  {path: '/mrz-scanner.html', component: RecognizerPage},
  {path: '/vin.html', component: RecognizerPage}
] */

const routes = [
  { path: '/', component: () => import('./components/HomePage.vue') },
  { path: '/mrz-scanner.html', component: () => import('./components/RecognizerPage.vue') },
  { path: '/vin.html', component: () => import('./components/RecognizerPage.vue') }
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

app.use(
  createGtm({
    id: 'GTM-538F83', // Your GTM single container ID, array of container ids ['GTM-xxxxxx', 'GTM-yyyyyy'] or array of objects [{id: 'GTM-xxxxxx', queryParams: { gtm_auth: 'abc123', gtm_preview: 'env-4', gtm_cookies_win: 'x'}}, {id: 'GTM-yyyyyy', queryParams: {gtm_auth: 'abc234', gtm_preview: 'env-5', gtm_cookies_win: 'x'}}], // Your GTM single container ID or array of container ids ['GTM-xxxxxx', 'GTM-yyyyyy']
    enabled: true, // defaults to true. Plugin can be disabled by setting this to false for Ex: enabled: !!GDPR_Cookie (optional)
    debug: true, // Whether or not display console logs debugs (optional)
  }),
);

// document.dispatchEvent(new Event('render-event'));

app.config.globalProperties.$message = message;

app.config.globalProperties.$message.config({
  top: '20%',
  duration: 2,
  maxCount: 2
});

app.mount('#app');