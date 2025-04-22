import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css' // Иконки (если нужно)
import router from './router' // Импорт роутера
import 'vuetify/styles' // Основные стили Vuetify
import { createPinia } from 'pinia' // Импорт Pinia
import { useThemeStore } from './stores/themeStore'


const app = createApp(App)
const pinia = createPinia() 

const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark', // 'light' или 'dark'
      themes: {
        light: { colors: { primary: '#1867C0' } },
        dark: { colors: { primary: '#2196F3' } },
      },
    },
  })



app.use(pinia) // Подключаем Pinia
app.use(vuetify)
app.use(router) // Подключение роутера

// Устанавливаем Vuetify в хранилище
const themeStore = useThemeStore()
themeStore.setVuetifyInstance(vuetify)


app.mount('#app')