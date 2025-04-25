<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from './stores/themeStore'
import { onMounted } from 'vue'
import { ref } from 'vue' // Не забудьте импортировать ref

const theme = useTheme() // Корректный вызов внутри setup()
const themeStore = useThemeStore() //загружаем тему из хранилища

const drawer = ref(false) // Добавляем реактивную переменную для управления drawer

onMounted(() => {
  themeStore.initTheme(theme) // Инициализация темы при загрузке
})


</script>

<template>
   <v-layout class="rounded rounded-md border">
    <v-app-bar title="Application bar" color="primary">
    <template v-slot:prepend>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>
  </template>
      <v-tooltip location="bottom">
                <template v-slot:activator="{ on: tooltip, attrs }">
                    <v-btn dark 
                          v-bind="attrs"
                          icon
                          @click="themeStore.toggleTheme"
                          v-on="{...tooltip}">
                          <v-icon v-if="themeStore.isDark">mdi-white-balance-sunny</v-icon>
                          <v-icon v-else>mdi-weather-night</v-icon>
                        <!--<v-icon :color="getColorTheme" dark>mdi-theme-light-dark</v-icon>-->
                    </v-btn>
                </template>
                <span>Переключить на {{$vuetify.theme.dark?"светлую":"темную" }} тему</span>
            </v-tooltip>

    </v-app-bar>

    <v-navigation-drawer  v-model="drawer">
      <v-list nav>
        <v-list-item title="Navigation drawer" link></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main >   
        <router-view v-slot="{ Component }">
            <v-fade-transition hide-on-leave>
              <component :is="Component" />
            </v-fade-transition>
        </router-view> 
    </v-main>
  </v-layout>

</template>

<style scoped>

</style>
