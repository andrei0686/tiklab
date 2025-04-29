import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css' // Иконки (если нужно)
import 'vuetify/styles' // Основные стили Vuetify

const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark', // 'light' или 'dark'
      themes: {
        light: { colors: { primary: '#1867C0' } },
        dark: { colors: { primary: '#2196F3' } },
      },
    },
  })

const app = createApp(App)
app.use(vuetify)
app.mount('#app')