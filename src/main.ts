import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './styles/app.css'

const app = createApp(App)
app.use(createPinia())
app.use(VueQueryPlugin)

app.mount(window.location.origin.includes('razormxc.beget.tech') ? '.vue-app-container' : '#app')
