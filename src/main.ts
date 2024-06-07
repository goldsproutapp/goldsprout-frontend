import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCircleExclamation, faHourglassHalf, faScrewdriverWrench} from '@fortawesome/free-solid-svg-icons';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import {Chart} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {registerFilters} from './lib/filters/methods';

Chart.register(annotationPlugin);
registerFilters();

const app = createApp(App)
app.use(PrimeVue);
app.use(ToastService)
app.use(ConfirmationService);
app.directive('tooltip', Tooltip);

library.add(faScrewdriverWrench);
library.add(faCircleExclamation);
library.add(faHourglassHalf);

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app')
