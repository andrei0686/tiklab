import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css' // Иконки (если нужно)
import router from './router' // Импорт роутера
import 'vuetify/styles' // Основные стили Vuetify
import { createPinia } from 'pinia' // Импорт Pinia
import { useSocketStore } from './stores/socketStore'

import colors from 'vuetify/util/colors'
 
import { io } from 'socket.io-client'

const app = createApp(App)
const pinia = createPinia() 

// Создаем подключение Socket.IO
const socket = io('http://localhost:3001', { // или ваш production URL
  autoConnect: false, // отключаем автоматическое подключение
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

// Добавляем socket в глобальные свойства приложения
app.config.globalProperties.$socket = socket

// ... после создания socket
const socketStore = useSocketStore(pinia)
socketStore.initializeSocket(socket)

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark', // 'light' или 'dark'
        themes: {
            light: {
                colors: {
                    primary: colors.teal.base,
                    // primary_lighten1: colors.teal.lighten1,
                    // primary_lighten2: colors.teal.lighten2,
                    // primary_lighten3: colors.teal.lighten3,
                    // primary_lighten4: colors.teal.lighten4,
                    // primary_lighten5: colors.teal.lighten5,
                    // primary_darken1: colors.teal.darken1,
                    // primary_darken2: colors.teal.darken2,
                    // primary_darken3: colors.teal.darken3,
                    // primary_darken4: colors.teal.darken4,
                    // primary_darken5: colors.teal.darken5,
                    secondary: colors.teal.lighten5,
                    accent: colors.purple.base,
                    error: colors.red.base,
                    warning: colors.orange.base,
                    info: colors.lightGreen.base,
                    success: colors.lightBlue.base
                },
            },
            dark: {
                colors: {
                    primary: colors.teal.darken4,
                    // primary_lighten1: colors.teal.lighten1,
                    // primary_lighten2: colors.teal.lighten2,
                    // primary_lighten3: colors.teal.lighten3,
                    // primary_lighten4: colors.teal.lighten4,
                    // primary_lighten5: colors.teal.lighten5,
                    // primary_darken1: colors.teal.darken1,
                    // primary_darken2: colors.teal.darken2,
                    // primary_darken3: colors.teal.darken3,
                    // primary_darken4: colors.teal.darken4,
                    // primary_darken5: colors.teal.darken5,
                    secondary: colors.teal.darken4,
                    accent: colors.purple.darken4,
                    error: colors.red.darken4,
                    warning: colors.orange.darken4, 
                    info: colors.lightGreen.darken4,
                    success: colors.lightBlue.darken4,
                },
            },
      },
    },
  })



app.use(pinia) // Подключаем Pinia
app.use(vuetify)
app.use(router) // Подключение роутера

var connection = 'https://' + window.location.host

// Подключаемся к сокету после монтирования приложения
app.mount('#app').$nextTick(() => {
  socket.connect()
})