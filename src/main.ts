import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCircleExclamation, faHourglassHalf, faScrewdriverWrench} from '@fortawesome/free-solid-svg-icons';

const app = createApp(App)
library.add(faScrewdriverWrench);
library.add(faCircleExclamation);
library.add(faHourglassHalf);

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app')
