module.exports = (io) => {
  // Хранилище активных тестов
  const activeTests = new Map()

  io.on('connection', (socket) => {
    console.log(`Клиент подключен: ${socket.id}`)

    // Обработка начала теста
    socket.on('start-test', (testConfig) => {
      const testId = generateTestId()
      activeTests.set(testId, {
        socket,
        config: testConfig,
        status: 'running'
      })

      // Эмуляция данных теста
      const interval = setInterval(() => {
        const testData = generateTestData(testConfig)
        socket.emit('test-data', testData)
      }, 1000)

      socket.on('disconnect', () => {
        clearInterval(interval)
        activeTests.delete(testId)
      })
    })


    // Обработка тестового сообщения
    socket.on('test_message', (data) => {
      console.log('Получено тестовое сообщение:', data);
      
      // Формируем ответ
      const response = {
          status: 'success',
          text: `Сервер получил ваше сообщение: "${data.text}"`,
          originalData: data,
          timestamp: new Date().toISOString()
      };
      
      // Отправляем ответ обратно клиенту
      socket.emit('test_response', response);
  });

    // Управление тестом
    socket.on('control-test', (data) => {
      console.log('Получено control-test:', data);
      // const test = activeTests.get(testId)
      // if (test) {
      //   test.status = action
      //   socket.emit('test-status', { status: action })
      // }
    })
  })

  function generateTestId() {
    return Math.random().toString(36).substring(2, 9)
  }

  function generateTestData(config) {
    // Генерация тестовых данных в зависимости от типа теста
    if (config.testType === 'amplitude') {
      return {
        x: Date.now(),
        y: Math.random() * config.range,
        type: 'amplitude'
      }
    } else {
      return {
        frequency: Math.random() * config.maxFrequency,
        amplitude: Math.random() * 10,
        type: 'frequency'
      }
    }
  }
}