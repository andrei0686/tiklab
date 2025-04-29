<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from './stores/themeStore'
import { useSocketStore } from './stores/socketStore'
import { onMounted, computed } from 'vue'
import { ref } from 'vue' // Не забудьте импортировать ref

const theme = useTheme() // Корректный вызов внутри setup()
const themeStore = useThemeStore() //загружаем тему из хранилища
const socketStore = useSocketStore() // 
const drawer = ref(true) // Добавляем реактивную переменную для управления drawer

onMounted(() => {
  themeStore.initTheme(theme) // Инициализация темы при загрузке
})


// Создаем computed свойство для удобства
const isConnected = computed(() => socketStore.isConnected)

</script>

<template>
  <v-layout class="rounded rounded-md border">
    <v-app-bar title="Application bar" color="primary">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>
      </template>

      <!-- <v-icon v-if="useSocketStore.isConnected">mdi-link_off</v-icon>
  <v-icon v-else>mdi-link</v-icon> -->

      <!-- Индикатор состояния подключения WebSocket -->
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" :color="isConnected ? 'success' : 'error'" class="mr-2">
            {{ isConnected ? 'mdi-link' : 'mdi-link-off' }}
          </v-icon>
        </template>
        <span>{{ isConnected ? 'WebSocket подключен' : 'WebSocket отключен' }}</span>
      </v-tooltip>

      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn dark v-bind="props" icon @click="themeStore.toggleTheme" v-on="{ ...tooltip }">
            <v-icon v-if="themeStore.isDark">mdi-white-balance-sunny</v-icon>
            <v-icon v-else>mdi-weather-night</v-icon>
            <!--<v-icon :color="getColorTheme" dark>mdi-theme-light-dark</v-icon>-->
          </v-btn>
        </template>
        <span>Переключить на {{ $vuetify.theme.dark ? "светлую" : "темную" }} тему</span>
      </v-tooltip>

    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list nav>
        <v-list-item title="Navigation drawer" link></v-list-item>

        <v-list-item title="Тест WebSocket" value="socket-test" to="/socket-test"
          prepend-icon="mdi-socket"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view v-slot="{ Component }">
        <v-fade-transition hide-on-leave>
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>
  </v-layout>

</template>

<style scoped></style>
