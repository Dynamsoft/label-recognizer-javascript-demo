import { createApp } from 'vue'
import App from './App.vue'
import { message } from 'ant-design-vue';

const app = createApp(App);

document.dispatchEvent(new Event('render-event'));

app.config.globalProperties.$message = message;

app.config.globalProperties.$message.config({
  top: '20%',
  duration: 2
});

app.mount('#app');