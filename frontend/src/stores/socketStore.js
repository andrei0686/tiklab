import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    isConnected: false,
    messages: [],
    socket: null
  }),
  actions: {
    initializeSocket(socket) {
      // Создаем подключение
      this.socket = socket

      // Обработчики событий
      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Socket connected')
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('Socket disconnected')
      })

      this.socket.on('test_response', (message) => {
        this.addMessage(message)
      })
    },
    
    sendTestMessage() {
      if (this.socket && this.isConnected) {
        this.socket.emit('test_message', {
          text: 'Тестовое сообщение от клиента',
          timestamp: new Date().toISOString()
        })
      } else {
        console.error('WebSocket не подключен')
      }
    },

    sendControlMessage() {
      if (this.socket && this.isConnected) {
        this.socket.emit('control-test', {
          text: 'Тестовое клиента',
          timestamp: new Date().toISOString()
        })
      } else {
        console.error('WebSocket не подключен')
      }
    },
    
    addMessage(message) {
      this.messages.unshift(message) // Добавляем в начало массива
    },
    
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
      }
    }
  }
})