/**
 * Базовый класс для подключения к портам (COM, TCP, etc.)
 * @class
 * @abstract
 */
class iPortConnector {
    /**
     * Создает экземпляр iPortConnector.
     * @param {Object} config - Конфигурация подключения.
     * @param {string} config.port - Имя порта (например, "COM3" или "192.168.1.1:8080").
     * @param {number} [config.timeout=5000] - Таймаут подключения в миллисекундах.
     */
    constructor(config) {
      this.config = config;
      this.isConnected = false;
    }
  
    /**
     * Устанавливает соединение с портом.
     * @abstract
     * @throws {Error} Если подключение не удалось.
     * @returns {Promise<void>}
     */
    async connect() {
      throw new Error("Метод connect() должен быть реализован!");
    }
  
    /**
     * Разрывает соединение с портом.
     * @abstract
     * @throws {Error} Если отключение не удалось.
     * @returns {Promise<void>}
     */
    async disconnect() {
      throw new Error("Метод disconnect() должен быть реализован!");
    }
  
    /**
     * Записывает значение по ключу.
     * @abstract
     * @param {string} key - Ключ (например, регистр Modbus или имя параметра).
     * @param {*} value - Значение для записи.
     * @throws {Error} Если запись не удалась.
     * @returns {Promise<void>}
     */
    async setValue(key, value) {
      throw new Error("Метод setValue() должен быть реализован!");
    }
  
    /**
     * Читает значение по ключу.
     * @abstract
     * @param {string} key - Ключ (например, регистр Modbus или имя параметра).
     * @throws {Error} Если чтение не удалось.
     * @returns {Promise<*>} Прочитанное значение.
     */
    async getValue(key) {
      throw new Error("Метод getValue() должен быть реализован!");
    }
  }