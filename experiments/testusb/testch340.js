// example CH341  https://gist.github.com/SeanAvery/9232d43fed3797ab1a8636f2e35c9dfc
// https://git.altlinux.org/gears/k/kernel-source-ch34x.git?p=kernel-source-ch34x.git;a=blob;f=ch34x.c;h=4cb5926922c586cd79ac648b4fdee14a6717476c;hb=8ffe04f27424497ef5e0569ce51c814a4cd797f8
const usb = require('usb');

// Константы для CH341 (из документации WCH)
const VENDOR_MODEM_OUT = 0xA4

const CH341_REQ_READ_VERSION = 0x5F
const CH341_REQ_WRITE_REG    = 0x9A  // Vendor-specific request
const CH341_REQ_READ_REG     = 0x95  // Vendor-specific request
const CH341_REQ_SERIAL_INIT  = 0xA1
const CH341_REQ_MODEM_CTRL   = 0xA4 // Управление линией (RTS/DTR)

const CH341_REG_BREAK        = 0x05
const CH341_REG_PRESCALER    = 0x12
const CH341_REG_DIVISOR      = 0x13
const CH341_REG_LCR          = 0x18
const CH341_REG_LCR2         = 0x25
const CH341_REG_FLOW_CTL     = 0x27

const CH341_NBREAK_BITS      = 0x01

const CH341_LCR_ENABLE_RX    = 0x80
const CH341_LCR_ENABLE_TX    = 0x40
const CH341_LCR_MARK_SPACE   = 0x20
const CH341_LCR_PAR_EVEN     = 0x10
const CH341_LCR_ENABLE_PAR   = 0x08
const CH341_LCR_STOP_BITS_2  = 0x04
const CH341_LCR_CS8          = 0x03
const CH341_LCR_CS7          = 0x02
const CH341_LCR_CS6          = 0x01
const CH341_LCR_CS5          = 0x00

const CH341_FLOW_CTL_NONE    = 0x00
const CH341_FLOW_CTL_RTSCTS  = 0x01

const CH341_CLKRATE = 12000000;

// const CH341_QUIRK_LIMITED_PRESCALER	BIT(0)
// const CH341_QUIRK_SIMULATE_BREAK	BIT(1)

// Получаем аргументы командной строки (массив)
const args = process.argv;

// Значение по умолчанию
const DEFAULT_SPEED = 9600;
const speed = args[2] ? parseInt(args[2]) : DEFAULT_SPEED;

console.log(`Скорость: ${speed}`);

function USB_DEVICE(VID, DID){
    return  { idVendor:VID, idProduct:DID}
}

const id_table = [
	 USB_DEVICE(0x1a86, 0x5523) ,
	 USB_DEVICE(0x1a86, 0x7522) ,
	 USB_DEVICE(0x1a86, 0x7523) ,
	 USB_DEVICE(0x2184, 0x0057) ,
	 USB_DEVICE(0x4348, 0x5523) ,
	 USB_DEVICE(0x9986, 0x7523) 
];


/**
 * Выполняет controlTransfer с обработкой ошибок
 * @param {Object} device - USB устройство
 * @param {number} requestType - Тип запроса (0x40 для vendor requests)
 * @param {number} request - Константа запроса (CH34x_REQ_*)
 * @param {number} value - Значение для запроса
 * @param {number} index - Индекс для запроса
 * @param {Buffer} data - Буфер данных (пустой Buffer.from([]) если не нужен)
 * @returns {Promise<void>}
 */
async function controlTransfer(device, requestType, request, value, index, data) {
    console.log("transfer ", data)
    return new Promise((resolve, reject) => {
        device.controlTransfer(
            requestType,
            request,
            value,
            index,
            data,
            (err) => {
                if (err) {
                    reject(new Error(`Ошибка controlTransfer (запрос 0x${request.toString(16)}): ${err.message}`));
                } else {
                    resolve();
                }
            }
        );
    });
}

/**
 * Читает данные из CH34x (версию чипа или регистры)
 * @param {Object} device - USB устройство
 * @param {number} length - Размер данных для чтения (в байтах)
 * @returns {Promise<Buffer>} - Прочитанные данные
 */
async function readCH34xData(device, request, length = 2) {
    return new Promise((resolve, reject) => {
        device.controlTransfer(
            0xC0,                   // bmRequestType (0xC0 = устройство -> хост)
            request , // bRequest (запрос версии)
            0,                      // wValue
            device.interfaces[0].interfaceNumber, // wIndex (номер интерфейса)
            length,                 // wLength (сколько байт читать)
            (err, data) => {
                if (err) {
                    reject(new Error(`Ошибка чтения: ${err.message}`));
                } else {
                    resolve(data);
                }
            }
        );
    });
}
  

async function readCH34(device, adr) {
    return new Promise((resolve, reject) => {
        device.controlTransfer(
            0xC0,                   // bmRequestType (0xC0 = устройство -> хост)
            CH341_REQ_READ_REG , // bRequest (запрос версии)
            adr,                      // wValue
            device.interfaces[0].interfaceNumber,  // wIndex (номер интерфейса)
            2,                 // wLength (сколько байт читать)
            (err, data) => {
                if (err) {
                    reject(new Error(`Ошибка чтения: ${err.message}`));
                } else {
                    console.log("read ", data)
                    resolve(data);
                }
            }
        );
    });
}

/**
 * Читает данные из EEPROM CH34x
 * @param {Object} device - USB устройство
 * @param {number} startAddr - Начальный адрес (0x00–0x17)
 * @param {number} length - Количество байт для чтения
 * @returns {Promise<Buffer>} - Прочитанные данные
 */
async function readConfig(device, startAddr, length) {    

    for (i = 0; i < 10; i++) {
        await readCH34(device, i);
    }
}


function calculateBaudRegisters(baudRate) {
    const F_clock = 12000000; // 12 МГц
    let bestDiv = 0;
    let bestCount = 0;
    let bestError = Infinity;

    // Перебираем все возможные делители (DIV = 0, 1, 2, 3)
    for (let div = 0; div <= 4; div++) {
        let divider;
        switch (div) {
            case 0: divider = 1024; break;
            case 1: divider = 128; break;
            case 2: divider = 16; break;  
            case 3: divider = 2; break;
            case 4: divider = 1; break;
        }

        const F_div = F_clock / divider;
        const N = Math.round(F_div / baudRate);      
        const count = 256 - N;

        // Проверяем, что COUNT в допустимом диапазоне (0...254)
        if (count >= 0 && count <= 254) {
            const actualBaud = F_div / N;
            const error = Math.abs(actualBaud - baudRate) / baudRate;

            // Выбираем конфигурацию с минимальной ошибкой
            if (error < bestError) {
                bestError = error;
                bestDiv = div ;
                bestCount = count;
            }
        }
    }

    // Если не найдено подходящих значений
    if (bestError === Infinity) {
        throw new Error("Невозможно достичь заданной скорости с текущими настройками делителя.");
    }

    return {
        PRESCALER: bestDiv === 4 ? 7: bestDiv,
        DIVISOR: bestCount,
        actualBaudRate: (F_clock / [1024, 128, 16, 2, 1][bestDiv]) / (256 - bestCount),
        error: bestError * 100 + '%'
    };
}


async function configure(device, baudRate, lcr) {

    const versionData = await readCH34xData(device, CH341_REQ_READ_VERSION, 2);        
    console.log("Версия чипа:", versionData); 

    // reset
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_SERIAL_INIT,
        0,
        0,
        Buffer.from([])
    );

    //  
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_WRITE_REG,
        0x0F2C,
        0x0004,
        Buffer.from([])
    );

    //  CONTROL REGISTER
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_WRITE_REG,
        CH341_REG_LCR2 << 8 | CH341_REG_LCR,
        lcr,
        Buffer.from([])
    );

    // FLOW CTL
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_WRITE_REG,
        (CH341_REG_FLOW_CTL << 8 | CH341_REG_FLOW_CTL),
        CH341_FLOW_CTL_NONE,
        Buffer.from([])
    );
    
    await controlTransfer(
        device,
        0x40,
        VENDOR_MODEM_OUT,
        0x009F,
        0x0000,
        Buffer.from([])
    );

    const regs = calculateBaudRegisters(baudRate)
    console.log("actualBaudRate=" + regs.actualBaudRate)
    console.log("error=" + regs.error)
    console.log("DIVISOR=" + regs.DIVISOR)
    console.log("PRESCALER=" + regs.PRESCALER)

    // divisor & prescaler
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_WRITE_REG,
        CH341_REG_PRESCALER,
        regs.PRESCALER,
        Buffer.from([])
    );

    // divisor & prescaler
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_WRITE_REG,
        CH341_REG_DIVISOR,
        regs.DIVISOR,
        Buffer.from([])
    );

    dv = await readCH34(device, (CH341_REG_DIVISOR << 8 | CH341_REG_PRESCALER));
    console.log("div2=", dv)
}


async function sendData(endPoint, data){
    console.log("Send data " + data)
    return new Promise((resolve, reject) => {
        endPoint.transfer(data, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Данные успешно отправлены');
                resolve();
            }
        });
    })
}


// Ищем устройство CH341
const device = usb.getDeviceList().find(device => {
    return id_table.find(x =>{ return  device.deviceDescriptor.idVendor === x.idVendor &&  device.deviceDescriptor.idProduct === x.idProduct })
});


// Главная асинхронная функция
async function main() {
    if (device) {
        console.log('Устройство найдено:', device.deviceDescriptor.idVendor, device.deviceDescriptor.idProduct);
        console.log(`  - Vendor ID: ${device.deviceDescriptor.idVendor}`);
        console.log(`  - Product ID: ${device.deviceDescriptor.idProduct}`);
        console.log(`  - Device Address: ${device.deviceAddress}`);
        console.log(`  - Device Speed: ${device.speed}`);
        console.log(`  - Device Bus Number: ${device.busNumber}`);
        console.log(`  - Device Port Number: ${device.portNumbers}`);
        console.log(`  - Device Class: ${device.deviceDescriptor.bDeviceClass}`);

        try {
            console.log('Открываем устройство...');
            device.open();

            console.log('Отключаем kernel driver...');
            // Отключаем kernel driver (если активен)
            device.interfaces.forEach((intf) => {
                if (intf.isKernelDriverActive()) {
                    intf.detachKernelDriver();
                }
                intf.claim();
            });
  
            // setBaudRate(device)
            let lcr = CH341_LCR_ENABLE_RX | CH341_LCR_ENABLE_TX | CH341_LCR_CS8;        
            let baudRate = speed;         
            
            console.log('Настройка конфигурации...', lcr);
            await configure(device, baudRate, lcr);
            console.log('Устройство готово к работе!');

            console.log('Получаем endpoint...');
            const endpoint = device.interfaces[0].endpoints.find(e => e.direction === 'out');

            if (!endpoint) {
                throw new Error('Не найден выходной endpoint');
            }

            console.log('Отправляем данные...');
            const data = Buffer.from([0x01, 0x02, 0x03, 0xAA, 0x77, 0x66, 0x11]);

            await sendData(endpoint, data);
             
            console.log('Отправляем данные конец...');

        } catch (err) {
            console.error('Ошибка:', err);
            device.close();
        }
        finally {
            // Закрытие устройства и освобождение ресурсов
            if (device) {               
                device.close();                
            } 
        }
    } else {
        console.log('Устройство не найдено');
    }
    process.exit(0); // Явное завершение процесса
}

// Запуск главной функции
main().catch(console.error);
 



// // Получаем список всех USB-устройств
// const devices = usb.getDeviceList();

// // Выводим информацию о каждом устройстве
// devices.forEach(device => {
 
//   console.log(`Устройство найдено:`);
//   console.log(`  - Vendor ID: ${device.deviceDescriptor.idVendor}`);
//   console.log(`  - Product ID: ${device.deviceDescriptor.idProduct}`);
//   console.log(`  - Device Address: ${device.deviceAddress}`);
//   console.log(`  - Device Speed: ${device.speed}`);
//   console.log(`  - Device Bus Number: ${device.busNumber}`);
//   console.log(`  - Device Port Number: ${device.portNumbers}`);
//   console.log(`  - Device Class: ${device.deviceDescriptor.bDeviceClass}`);

 

// if (device.deviceDescriptor.idVendor ===  6790 && device.deviceDescriptor.idProduct === 29987){
//     console.log(`Устройство адрес 2 найдено:`);
//     console.log(`  - Vendor ID: ${device.deviceDescriptor.idVendor}`);
//     console.log(`  - Product ID: ${device.deviceDescriptor.idProduct}`);
//     console.log(`  - Device Address: ${device.deviceAddress}`);
//     console.log(`  - Device Speed: ${device.speed}`);
//     console.log(`  - Device Bus Number: ${device.busNumber}`);
//     console.log(`  - Device Port Number: ${device.portNumbers}`);
//     console.log(`  - Device Class: ${device.deviceDescriptor.bDeviceClass}`);
//     console.log(`---------------------------`);
//   }


// // //   try {
// // //     // Открываем устройство
// // //     device.open();

// // //     // Попытка получить описание продукта
// // //     if (device.deviceDescriptor.iProduct > 0) {
// // //       device.getStringDescriptor(device.deviceDescriptor.iProduct, (err, data) => {
// // //         if (err) {
// // //           console.error('Ошибка получения описания продукта:', err);
// // //         } else {
// // //           console.log(`  - Product Description: ${data}`);
// // //         }
// // //       });
// // //     }

// // //     // Попытка получить описание производителя
// // //     if (device.deviceDescriptor.iManufacturer > 0) {
// // //       device.getStringDescriptor(device.deviceDescriptor.iManufacturer, (err, data) => {
// // //         if (err) {
// // //           console.error('Ошибка получения описания производителя:', err);
// // //         } else {
// // //           console.log(`  - Manufacturer Description: ${data}`);
// // //         }
// // //       });
// // //     }

// // //     // Закрываем устройство после использования
// // //     device.close();
// // //   } catch (error) {
// // //     console.error('Ошибка открытия устройства:', error);
// // //   }


// });
