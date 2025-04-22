/**
 * Базовый класс команды с методами execute и undo.
 * @abstract
 */
class Command {
    /**
     * Выполняет команду.
     * @abstract
     * @returns {Promise<void>}
     */
    async execute() {
      throw new Error('Метод execute() должен быть реализован!');
    }
  
    /**
     * Отменяет команду.
     * @abstract
     * @returns {Promise<void>}
     */
    async undo() {
      throw new Error('Метод undo() должен быть реализован!');
    }
  }
  
  /**
   * Конкретная команда для записи в порт.
   */
  class WriteCommand extends Command {
    /**
     * @param {Port} port - Объект порта
     * @param {string} text - Текст для записи
     */
    constructor(port, text) {
      super();
      this.port = port;
      this.text = text;
      this.previousState = null; // Сохраняем состояние для отмены
    }
  
    async execute() {
      // Сохраняем текущие данные порта перед изменением
      this.previousState = await this.port.read();
      console.log(`[WriteCommand] Пишу: "${this.text}"`);
      await this.port.write(this.text);
    }
  
    async undo() {
      if (!this.previousState) return;
      console.log(`[WriteCommand] Отмена: восстанавливаю "${this.previousState}"`);
      await this.port.write(this.previousState);
    }
  }
  
  /**
   * Команда для открытия порта.
   */
  class OpenPortCommand extends Command {
    constructor(port) {
      super();
      this.port = port;
      this.wasOpen = false;
    }
  
    async execute() {
      this.wasOpen = this.port.isOpen;
      if (!this.wasOpen) {
        console.log('[OpenPortCommand] Открываю порт');
        await this.port.open();
      }
    }
  
    async undo() {
      if (!this.wasOpen) {
        console.log('[OpenPortCommand] Отмена: закрываю порт');
        await this.port.close();
      }
    }
  }
  
  /**
   * Очередь команд с поддержкой отмены.
   */
  class CommandQueue {
    constructor() {
      this.commands = [];
      this.history = []; // История выполненных команд для undo
    }
  
    /**
     * Добавляет команду в очередь.
     * @param {Command} command 
     */
    add(command) {
      this.commands.push(command);
    }
  
    /**
     * Выполняет все команды последовательно.
     * @returns {Promise<void>}
     */
    async executeAll() {
      while (this.commands.length > 0) {
        const cmd = this.commands.shift();
        await cmd.execute();
        this.history.push(cmd); // Сохраняем для возможной отмены
      }
    }
  
    /**
     * Отменяет последнюю команду.
     * @returns {Promise<void>}
     */
    async undoLast() {
      const cmd = this.history.pop();
      if (cmd) await cmd.undo();
    }
  
    /**
     * Отменяет все выполненные команды в обратном порядке.
     * @returns {Promise<void>}
     */
    async undoAll() {
      while (this.history.length > 0) {
        await this.undoLast();
      }
    }
  }