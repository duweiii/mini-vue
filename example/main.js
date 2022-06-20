import { createApp } from '../lib/guide-mini-vue.esm.js';
// import { App } from './app.js'
import { App } from './app-provider-inject.js';

createApp(App).mount(document.querySelector("#app"))