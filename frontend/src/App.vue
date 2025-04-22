<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from './stores/themeStore'
import { onMounted } from 'vue'

const theme = useTheme() // Корректный вызов внутри setup()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme(theme) // Инициализация темы при загрузке
})



// const toggleTheme = () => {
//   theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
// }





</script>

<template>
 
  <HelloWorld msg="Vite + Vue" />
  <div>

    <VBtn @click="themeStore.toggleTheme">
    {{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}
  </VBtn>
  </div>

  <v-layout class="rounded rounded-md border">
    <v-app-bar title="Application bar">
      <v-tooltip bottom>
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

    <v-navigation-drawer>
      <v-list nav>
        <v-list-item title="Navigation drawer" link></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" height="300">
      <v-container>
        <router-view v-slot="{ Component }">
            <v-fade-transition hide-on-leave>
              <component :is="Component" />
            </v-fade-transition>
        </router-view>
        <v-sheet
          border="dashed md"
          color="surface-light"
          height="200"
          rounded="lg"
          width="100%"
        ></v-sheet>
      </v-container>
    </v-main>
  </v-layout>

</template>

<style scoped>

</style>
