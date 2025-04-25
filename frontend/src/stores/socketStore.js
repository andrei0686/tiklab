import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    isConnected: false,
    messages: []
  }),
  actions: {
    initializeSocket(socket) {
      socket.on('connect', () => {
        this.isConnected = true
      })

      socket.on('disconnect', () => {
        this.isConnected = false
      })

      socket.on('test_response', (message) => {
        this.messages.push(message)
      })
    },
    sendTestMessage(socket) {
      socket.emit('test_message', {
        text: 'Test from Pinia',
        timestamp: new Date()
      })
    }
  }
})