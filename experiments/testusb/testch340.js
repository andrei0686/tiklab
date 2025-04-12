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
  


/**
 * Инициализирует CH34x устройство
 * @param {Object} device - USB устройство
 * @returns {Promise<void>}
 */
async function initCH34x(device) {
    try {
        // reset
        await controlTransfer(
            device,
            0x40,
            CH341_REQ_SERIAL_INIT,
            0,
            0,
            Buffer.from([])
        );

        // //  
        // await controlTransfer(
        //     device,
        //     0x40,
        //     CH341_REQ_WRITE_REG,
        //     0x0F2C,
        //     0x0004,
        //     Buffer.from([])
        // );

        //  
        await controlTransfer(
            device,
            0x40,
            CH341_REQ_WRITE_REG,
            CH341_REG_LCR2 << 8 | CH341_REG_LCR,
            0x0050, //0x0000
            Buffer.from([])
        );

        // 
        await controlTransfer(
            device,
            0x40,
            CH341_REQ_WRITE_REG,
            0x2727,
            0x0000,  
            Buffer.from([])
        );
        
        // 
        await controlTransfer(
            device,
            0x40,
            VENDOR_MODEM_OUT,
            0x009F,
            0x0000,
            Buffer.from([])
        );

        // // 
        // await controlTransfer(
        //     device,
        //     0x40,
        //     CH341_REQ_SERIAL_INIT,
        //     0x501f,
        //     0xd90a,
        //     Buffer.from([])
        // );

        console.log("CH34x успешно инициализирован");
    } catch (err) {
        console.error("Ошибка инициализации CH34x:", err.message);
        throw err; // Пробрасываем ошибку дальше
    }
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

async function printInfo(device){
    // try {

        //Чтение версии чипа (2 байта)
        const versionData = await readCH34xData(device, CH341_REQ_READ_VERSION, 2);        
        console.log("Версия чипа:", versionData); 
 

    // } catch (err) {
    //     console.error("Ошибка инициализации CH34x:", err.message);
    //     throw err; // Пробрасываем ошибку дальше
    // }
}


function calculateBaudRegisters(baudRate) {
    const F_clock = 12000000; // 12 МГц
    let bestDiv = 0;
    let bestCount = 0;
    let bestError = Infinity;

    // Перебираем все возможные делители (DIV = 0, 1, 2, 3)
    for (let div = 0; div <= 3; div++) {
        let divider;
        switch (div) {
            case 0: divider = 1024; break;
            case 1: divider = 128; break;
            case 2: divider = 16; break;  // Уточните, 15 или 16?
            case 3: divider = 2; break;
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
                bestDiv = div;
                bestCount = count;
            }
        }
    }

    // Если не найдено подходящих значений
    if (bestError === Infinity) {
        throw new Error("Невозможно достичь заданной скорости с текущими настройками делителя.");
    }

    return {
        PRESCALER: bestDiv,
        DIVISOR: bestCount,
        actualBaudRate: (F_clock / [1024, 128, 16, 2][bestDiv]) / (256 - bestCount),
        error: bestError * 100 + '%'
    };
}


async function configure(device, baudRate, lcr) {
    // reset
    await controlTransfer(
        device,
        0x40,
        CH341_REQ_SERIAL_INIT,
        0,
        0,
        Buffer.from([])
    );


    // //  
    // await controlTransfer(
    //     device,
    //     0x40,
    //     CH341_REQ_WRITE_REG,
    //     0x0F2C,
    //     device.interfaces[0].interfaceNumber,
    //     Buffer.from([0x00,0x04])
    // );

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

    // 
    // await controlTransfer(
    //     device,
    //     0x40,
    //     VENDOR_MODEM_OUT,
    //     0x009F,
    //     0x0000,
    //     Buffer.from([])
    // );

    const regs = calculateBaudRegisters(baudRate)

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

// Настройка Baud Rate с чтением регистров
function setBaudRate(device, baudRate, callback) {
    return new Promise((resolve, reject) => {
        const CH341_REQ_READ_REG = 0x95;
        const CH341_REQ_WRITE_REG = 0x9A;
        const REG_ADDR = 0x1312;

        let devisL = 0;
        let devisH = 0;

        console.log("Start baudRate setting");

        // 1. Инициализация (аналог CH341_REQ_SERIAL_INIT)
        device.controlTransfer(
            0x40, CH341_REQ_SERIAL_INIT, 0, 0, Buffer.from([]), (err) => {
                if (err) {
                    console.error("Ошибка инициализации:", err);
                    return callback(err);
                }

                // 1. Чтение текущих значений регистров
                device.controlTransfer(
                    0xC0,
                    CH341_REQ_READ_VERSION,
                    0,
                    device.interfaces[0].interfaceNumber,
                    2,
                    (err, data) => {
                        if (err) {
                            console.error("Ошибка чтения регистров:", err);
                            return callback(err);
                        }
                        else console.log("Версия чипа:", data);

                        // 1. Чтение текущих значений регистров
                        device.controlTransfer(
                            0xC0,
                            CH341_REQ_READ_REG,
                            REG_ADDR,
                            device.interfaces[0].interfaceNumber,
                            4,
                            (err, data) => {
                                if (err) {
                                    console.error("Ошибка чтения регистров:", err);
                                    return callback(err);
                                }

                                console.log("Текущие значения регистров:");
                                console.log("Регистр 0x12 (Prescaler):", data[0]);
                                console.log("Регистр 0x13 (Divisor):", data[1]);

                                devisL = data[0]
                                devisH = data[1]

                                // 1. Чтение текущих значений регистров
                                device.controlTransfer(
                                    0xC0,
                                    CH341_REQ_READ_REG,
                                    0x2518,
                                    device.interfaces[0].interfaceNumber,
                                    4,
                                    (err, data) => {
                                        if (err) {
                                            console.error("Ошибка чтения регистров:", err);
                                            return callback(err);
                                        }

                                        console.log("Текущие значения регистров:");
                                        console.log("Регистр 0x18 (LCR):", data[0]);
                                        console.log("Регистр 0x25 (LCR2):", data[1]);

                                        // 2. Расчет новых значений
                                        const divisor = Math.round(48000000 / (baudRate * 2));
                                        let divisorH = (divisor >> 8) & 0xFF;
                                        let divisorL = divisor & 0xFF;



                                        divisorH |= 0x80;

                                        divisorL = devisL
                                        divisorH = devisH

                                        console.log("\nНовые значения:");
                                        console.log("divisorL:", divisorL);
                                        console.log("divisorH:", divisorH);
  					                    callback();

                                        // 3. Запись новых значений
                                        device.controlTransfer(
                                            0x20,
                                            CH341_REQ_WRITE_REG,
                                            REG_ADDR,
                                            device.interfaces[0].interfaceNumber,
                                            Buffer.from([divisorL, divisorH]),
                                            (err) => {
                                                if (err) {
                                                    console.error("Ошибка настройки скорости:", err);
                                                    callback(err);
                                                } else {
                                                    console.log(`Скорость успешно установлена: ${baudRate} бод`);
                                                    callback();
                                                }
                                            }
                                        );
                                    })
                            }
                        );

                    });


            }
        );


    });
}


// Ищем устройство CH341
const device = usb.getDeviceList().find(device => {
    return id_table.find(x =>{ return  device.deviceDescriptor.idVendor === x.idVendor &&  device.deviceDescriptor.idProduct === x.idProduct })
});

// // ID производителя и устройства для CH341/CH341
// const CH341_VENDOR_ID = 0x1a86;
// const CH341_PRODUCT_ID = 0x7523; // Для CH341. Для CH341 может быть другим.

// // Находим устройство
// const device = usb.findByIds(CH341_VENDOR_ID, CH341_PRODUCT_ID);





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

            console.log('Информаци об устрйостве...');
            await printInfo(device);
           
         //   console.log('Чтение...');
         //   await readConfig(device); // Читаем 4 байта (VID + PID)


            // setBaudRate(device)
            let lcr = CH341_LCR_ENABLE_RX | CH341_LCR_ENABLE_TX | CH341_LCR_CS8;
        

            let baudRate = 921600;          

           // console.log("DIVISOR=",ch341CalculateDivisor(19200).toString(16)); // Выведет hex значение
            
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
        //    await endpoint.transfer(data, (err) => {
        //         if (err) {
        //             console.error('Ошибка передачи:', err);
        //         } else {
        //             console.log('Данные успешно отправлены');
        //         }

        //         // Закрываем устройство
        //      //   device.close();
        //     });

            
            console.log('Отправляем данные конец...');


            // // Устанавливаем скорость (например, 9600 бод)
            // setBaudRate(device, 9600, (err) => {

            //     console.log("Готово1!");
            //     if (err) console.error(err);
            //     else {
            //         console.log("Готово!");
            //         console.log('Получаем endpoint...');
            //         const endpoint = device.interfaces[0].endpoints.find(e => e.direction === 'out');

            //         if (!endpoint) {
            //             throw new Error('Не найден выходной endpoint');
            //         }

            //         console.log('Отправляем данные...');
            //         const data = Buffer.from([0x01, 0x02, 0x03, 0xAA, 0x77, 0x66, 0x11]);
            //         endpoint.transfer(data, (err) => {
            //             if (err) {
            //                 console.error('Ошибка передачи:', err);
            //             } else {
            //                 console.log('Данные успешно отправлены');
            //             }

            //             // Закрываем устройство
            //             device.close();
            //         });
            //     }

            // });


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
 


// function setBaudRate(device, baudRate) {
//     // Константы из драйвера Linux
//     const CH341_CLKRATE = 12000000; // 48 MHz в драйвере (не 12!)
//     const CH341_REQ_SERIAL_INIT = 0xA1;
//     const CH341_REQ_WRITE_REG = 0x9A;
//     const CH341_REG_PRESCALER = 0x12;
//     const CH341_REG_DIVISOR = 0x13;

//     console.log(` SetBaudRate `);

//     // 1. Инициализация (аналог CH341_REQ_SERIAL_INIT)
//     device.controlTransfer(
//         0x40, CH341_REQ_SERIAL_INIT, 0, 0, Buffer.from([]), (err) => {
//             if (err) console.error("Ошибка инициализации:", err);
//         }
//     );

// 	console.log(` SetBaudRate 2 `);

//     // 2. Расчет параметров (аналогично драйверу Linux)
//     let ps, fact, div;
//     for (ps = 3; ps >= 0; ps--) {
//         const clk_div = 1 << (12 - 3 * ps - 1); // fact=1
//         div = Math.round(CH341_CLKRATE / (clk_div * baudRate));
//         if (div >= 2 && div <= 256) {
//             fact = 1;
//             break;
//         }
//     }

// console.log(` SetBaudRate 3 `);

//     // Если не нашли - пробуем fact=0
//     if (div < 2 || div > 256) {
//         for (ps = 3; ps >= 0; ps--) {
//             const clk_div = 1 << (12 - 3 * ps - 0); // fact=0
//             div = Math.round(CH341_CLKRATE / (clk_div * baudRate));
//             if (div >= 2 && div <= 256) {
//                 fact = 0;
//                 break;
//             }
//         }
//     }

// console.log(` SetBaudRate 4 `);

//     if (div < 2 || div > 256) {
//         console.error("Неподдерживаемая скорость:", baudRate);
//         return;
//     }

//     // 3. Упаковка в формат драйвера Linux
//     const val = ((0x100 - div) << 8) | (fact << 2) | ps;

// console.log(` SetBaudRate 5 `);
//     // 4. Отправка запроса (регистры 0x12 и 0x13)
//     device.controlTransfer(
//         0x40, CH341_REQ_WRITE_REG,
//         CH341_REG_DIVISOR << 8 | CH341_REG_PRESCALER,
//         device.interfaces[0].interfaceNumber,
//         Buffer.from([val & 0xFF, (val >> 8) & 0xFF]),
//         (err) => {
//             if (err) console.error("Ошибка настройки скорости:", err);
//             else console.log("Скорость установлена:", baudRate);
//         }
//     );
// }







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
