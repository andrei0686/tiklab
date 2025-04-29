<template>
    <div>
        <v-card class="pa-4">
            <v-card-title>WebSocket Тест</v-card-title>

            <v-card-text>
                <v-btn color="primary" @click="sendMessage" :disabled="!isConnected">
                    Отправить тестовое сообщение
                </v-btn>
        <v-btn color="primary" @click="sendMessage2" :disabled="!isConnected">
                    Отправить контрольное сообщение
                </v-btn>
                <v-alert class="mt-4" :type="isConnected ? 'success' : 'error'"
                    :text="isConnected ? 'WebSocket подключен' : 'WebSocket отключен'" />
            </v-card-text>

            <v-card-text>
                <h3>Полученные сообщения:</h3>
                <v-list v-if="messages.length">
                    <v-list-item v-for="(msg, index) in messages" :key="index">
                        <v-list-item-title>{{ msg.text }}</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(msg.timestamp) }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
                <v-alert v-else text="Нет полученных сообщений" type="info" />
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { useSocketStore } from '../stores/socketStore'
import { mapState, mapActions } from 'pinia'

export default {
    computed: {
        ...mapState(useSocketStore, ['isConnected', 'messages'])
    },
    methods: {
        ...mapActions(useSocketStore, ['sendTestMessage','sendControlMessage']),

        sendMessage() {
            this.sendTestMessage()
        },
        sendMessage2() {
            this.sendControlMessage()
        },
        formatDate(isoString) {
            return new Date(isoString).toLocaleString()
        }
    }
}
</script>