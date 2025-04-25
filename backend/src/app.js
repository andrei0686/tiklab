const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { instrument } = require('@socket.io/admin-ui')

const app = express()
app.use(cors())

// HTTP-сервер
const httpServer = createServer(app)

// Socket.IO сервер
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://admin.socket.io"],
        credentials: true
    }
})

// Подключение админ-панели (опционально)
instrument(io, {
    auth: false,
    mode: "development",
    allowedHosts: ["localhost"]
})


// instrument(io, {
//     auth: {
//       type: "basic",
//       username: process.env.ADMIN_USER || "admin",
//       password: process.env.ADMIN_PASS || "$2b$10$W5OFM5Bmz66fWtvA5X4LkO8Q/s7WJhJfXjvVtZ9y6n8r9X1VY3XbW"
//     },
//     mode: process.env.NODE_ENV === "production" ? "production" : "development"
//   })

app.get('/', (req, res) => {
    res.json({ socketio: "https://admin.socket.io", web: "http://localhost:5173" })
})

// REST API
app.get('/api/tests', (req, res) => {
    res.json({ message: "API работает" })
})

// Подключение Socket.IO
require('./socket')(io)

// Запуск сервера
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`)
})