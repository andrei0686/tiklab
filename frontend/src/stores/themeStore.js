import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDark: false,
        _vuetify: null, // Храним ссылку на Vuetify,
        _theme: null,
    }),
    actions: {
        toggleTheme() {
            this.isDark = !this.isDark
            localStorage.setItem('theme', this.isDark ? 'dark' : 'light')           
            this.applyTheme()
        },
        initTheme(theme) {
            this._theme = theme;
            const savedTheme = localStorage.getItem('theme')       
            if (savedTheme) {
                this.isDark = savedTheme === 'dark'
                this.applyTheme()
            }
        },
        applyTheme() {
            if (this._theme) {
                this._theme.global.name =  this.isDark ?  'dark': 'light'
            }
        },
        setVuetifyInstance(vuetify) {
            this._vuetify = vuetify
        }
    }
})