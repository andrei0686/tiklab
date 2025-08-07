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
const selectedItem = ref(null)

const toggleItem = (item) => {
  if (selectedItem.value === item) {
    // Повторный клик на тот же элемент: снимаем выделение и закрываем меню
    selectedItem.value = null;
    drawer.value = false;
  } else {
    // Новый выбор: выделяем элемент и открываем меню
    selectedItem.value = item;
    drawer.value = true;
  }
};

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
    <!-- Rail-меню -->
    <v-navigation-drawer permanent rail>
      <!-- <v-list>
        <v-list-item prepend-icon="mdi-view-dashboard"></v-list-item>
      </v-list>

      <v-divider></v-divider> -->

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" value="dashboard" @click="toggleItem('dashboard')"
          :active="selectedItem === 'dashboard'"></v-list-item>
        <v-list-item prepend-icon="mdi-gauge" value="dashboard" @click="toggleItem('gauge')"
          :active="selectedItem === 'gauge'"></v-list-item>
        <v-list-item prepend-icon="mdi-file-cabinet" value="messages" @click="toggleItem('files')"
          :active="selectedItem === 'files'"></v-list-item>
        <v-list-item prepend-icon="mdi-forum" value="messages" @click="toggleItem('messages')"
          :active="selectedItem === 'messages'"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" value="settings" @click="toggleItem('settings')"
          :active="selectedItem === 'settings'"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Основное меню -->
    <v-navigation-drawer v-model="drawer">
      <v-list nav>
        <v-list-subheader>ОБОЗРЕВАТЕЛЬ</v-list-subheader>
        <v-list-item title="Тест WebSocket" value="socket-test" to="/socket-test"
          prepend-icon="mdi-socket"></v-list-item>
      </v-list>

      <v-list>
        <v-list-item title="Home" value="home"></v-list-item>
        <v-list-item title="Amplitude" value="Amplitude" to="/amplitude"></v-list-item>
        <v-list-item title="Settings" value="settings"></v-list-item>
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
