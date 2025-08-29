#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <termios.h>
#include <libusb-1.0/libusb.h>
#include <signal.h>
#include <stdbool.h>
#include <time.h>
#include <math.h>  // Добавлен math.h для fabs()

// Константы для CH341
#define VENDOR_MODEM_OUT 0xA4

#define CH341_REQ_READ_VERSION 0x5F
#define CH341_REQ_WRITE_REG    0x9A
#define CH341_REQ_READ_REG     0x95
#define CH341_REQ_SERIAL_INIT  0xA1
#define CH341_REQ_MODEM_CTRL   0xA4

#define CH341_REG_BREAK        0x05
#define CH341_REG_PRESCALER    0x12
#define CH341_REG_DIVISOR      0x13
#define CH341_REG_LCR          0x18
#define CH341_REG_LCR2         0x25
#define CH341_REG_FLOW_CTL     0x27

#define CH341_NBREAK_BITS      0x01

#define CH341_LCR_ENABLE_RX    0x80
#define CH341_LCR_ENABLE_TX    0x40
#define CH341_LCR_MARK_SPACE   0x20
#define CH341_LCR_PAR_EVEN     0x10
#define CH341_LCR_ENABLE_PAR   0x08
#define CH341_LCR_STOP_BITS_2  0x04
#define CH341_LCR_CS8          0x03
#define CH341_LCR_CS7          0x02
#define CH341_LCR_CS6          0x01
#define CH341_LCR_CS5          0x00

#define CH341_FLOW_CTL_NONE    0x00
#define CH341_FLOW_CTL_RTSCTS  0x01

#define CH341_CLKRATE 12000000

#define MAX_COUNT (1000000)

// Структура для USB устройств
typedef struct {
    uint16_t idVendor;
    uint16_t idProduct;
} USB_DEVICE;

// Таблица поддерживаемых устройств
USB_DEVICE id_table[] = {
    {0x1a86, 0x5523},
    {0x1a86, 0x7522},
    {0x1a86, 0x7523},
    {0x2184, 0x0057},
    {0x4348, 0x5523},
    {0x9986, 0x7523}
};

volatile sig_atomic_t is_running = true;

void signal_handler(int sig) {
    is_running = false;
}

// Структура для регистров скорости
typedef struct {
    int PRESCALER;
    int DIVISOR;
    double actualBaudRate;
    char error[20];
} BaudRegisters;

// Функция для расчета регистров скорости
BaudRegisters calculateBaudRegisters(int baudRate) {
    const int F_clock = 12000000;
    BaudRegisters result = {0};
    double bestError = 1e9;
    int bestDiv = 0;
    int bestCount = 0;

    for (int div = 0; div <= 4; div++) {
        int divider;
        switch (div) {
            case 0: divider = 1024; break;
            case 1: divider = 128; break;
            case 2: divider = 16; break;
            case 3: divider = 2; break;
            case 4: divider = 1; break;
            default: divider = 1; break;
        }

        double F_div = (double)F_clock / divider;
        int N = (int)(F_div / baudRate + 0.5);
        int count = 256 - N;

        if (count >= 0 && count <= 254) {
            double actualBaud = F_div / N;
            double error = fabs(actualBaud - baudRate) / baudRate;

            if (error < bestError) {
                bestError = error;
                bestDiv = div;
                bestCount = count;
                result.actualBaudRate = actualBaud;
            }
        }
    }

    if (bestError > 1e8) {
        strcpy(result.error, "Невозможно");
        return result;
    }

    result.PRESCALER = (bestDiv == 4) ? 7 : bestDiv;
    result.DIVISOR = bestCount;
    snprintf(result.error, sizeof(result.error), "%.2f%%", bestError * 100);

    return result;
}

// Функция для controlTransfer
int control_transfer(libusb_device_handle *handle, uint8_t requestType, 
                    uint8_t request, uint16_t value, uint16_t index, 
                    unsigned char *data, uint16_t length, unsigned int timeout) {
    int r = libusb_control_transfer(handle, requestType, request, value, 
                                   index, data, length, timeout);
    if (r < 0) {
        fprintf(stderr, "Ошибка controlTransfer: %s\n", libusb_error_name(r));
        return -1;
    }
    return r;
}

// Функция для чтения данных
int read_ch34_data(libusb_device_handle *handle, uint8_t request, 
                  unsigned char *data, uint16_t length, int interface) {
    return control_transfer(handle, 0xC0, request, 0, interface, data, length, 1000);
}

// Функция для настройки устройства
int configure_device(libusb_device_handle *handle, int baudRate, int lcr, int interface) {
    unsigned char version_data[2];
    
    // Чтение версии
    if (read_ch34_data(handle, CH341_REQ_READ_VERSION, version_data, 2, interface) < 0) {
        return -1;
    }
    printf("Версия чипа: %02X %02X\n", version_data[0], version_data[1]);

    // Сброс
    if (control_transfer(handle, 0x40, CH341_REQ_SERIAL_INIT, 0, 0, NULL, 0, 1000) < 0) {
        return -1;
    }

    // Дополнительные настройки
    if (control_transfer(handle, 0x40, CH341_REQ_WRITE_REG, 0x0F2C, 0x0004, NULL, 0, 1000) < 0) {
        return -1;
    }

    // CONTROL REGISTER
    uint16_t lcr_value = (CH341_REG_LCR2 << 8) | CH341_REG_LCR;
    if (control_transfer(handle, 0x40, CH341_REQ_WRITE_REG, lcr_value, lcr, NULL, 0, 1000) < 0) {
        return -1;
    }

    // FLOW CTL
    uint16_t flow_ctl_value = (CH341_REG_FLOW_CTL << 8) | CH341_REG_FLOW_CTL;
    if (control_transfer(handle, 0x40, CH341_REQ_WRITE_REG, flow_ctl_value, 
                        CH341_FLOW_CTL_NONE, NULL, 0, 1000) < 0) {
        return -1;
    }

    // MODEM OUT
    if (control_transfer(handle, 0x40, VENDOR_MODEM_OUT, 0x009F, 0x0000, NULL, 0, 1000) < 0) {
        return -1;
    }

    // Настройка скорости
    BaudRegisters regs = calculateBaudRegisters(baudRate);
    printf("actualBaudRate=%.0f\n", regs.actualBaudRate);
    printf("error=%s\n", regs.error);
    printf("DIVISOR=%d\n", regs.DIVISOR);
    printf("PRESCALER=%d\n", regs.PRESCALER);

    // PRESCALER
    if (control_transfer(handle, 0x40, CH341_REQ_WRITE_REG, CH341_REG_PRESCALER, 
                        regs.PRESCALER, NULL, 0, 1000) < 0) {
        return -1;
    }

    // DIVISOR
    if (control_transfer(handle, 0x40, CH341_REQ_WRITE_REG, CH341_REG_DIVISOR, 
                        regs.DIVISOR, NULL, 0, 1000) < 0) {
        return -1;
    }

    return 0;
}

// Функция для отправки данных
int send_data(libusb_device_handle *handle, unsigned char endpoint, 
             unsigned char *data, int length) {
    int transferred;
    int r = libusb_bulk_transfer(handle, endpoint, data, length, &transferred, 10000);
    if (r == 0 && transferred == length) {
        return 0;
    } else {
        fprintf(stderr, "Ошибка отправки: %s\n", libusb_error_name(r));
        return -1;
    }
}

int main(int argc, char *argv[]) {
    libusb_context *ctx = NULL;
    libusb_device_handle *handle = NULL;
    int r;
    int speed = 9600;

    // Парсинг аргументов
    if (argc > 1) {
        speed = atoi(argv[1]);
    }
    printf("Скорость: %d\n", speed);

    // Инициализация libusb
    r = libusb_init(&ctx);
    if (r < 0) {
        fprintf(stderr, "Ошибка инициализации libusb: %s\n", libusb_error_name(r));
        return 1;
    }

    // Поиск устройства
    printf("поиск устройства начало\n");
    libusb_device **devs;
    ssize_t cnt = libusb_get_device_list(ctx, &devs);
    if (cnt < 0) {
        fprintf(stderr, "Ошибка получения списка устройств\n");
        libusb_exit(ctx);
        return 1;
    }

    libusb_device *found_device = NULL;
    struct libusb_device_descriptor desc;
    
    for (ssize_t i = 0; i < cnt; i++) {
        r = libusb_get_device_descriptor(devs[i], &desc);
        if (r < 0) continue;

        printf(" устройство %04X\n", desc.idVendor);

        for (size_t j = 0; j < sizeof(id_table)/sizeof(id_table[0]); j++) {
            if (desc.idVendor == id_table[j].idVendor && 
                desc.idProduct == id_table[j].idProduct) {
                found_device = devs[i];
                break;
            }
        }
        if (found_device) break;
    }
    printf("поиск устройства конец\n");

    if (!found_device) {
        printf("Устройство не найдено\n");
        libusb_free_device_list(devs, 1);
        libusb_exit(ctx);
        return 1;
    }

    // Получаем дескриптор устройства для вывода информации
    r = libusb_get_device_descriptor(found_device, &desc);
    if (r < 0) {
        fprintf(stderr, "Ошибка получения дескриптора устройства\n");
        libusb_free_device_list(devs, 1);
        libusb_exit(ctx);
        return 1;
    }

    printf("Устройство найдено: %04X:%04X\n", desc.idVendor, desc.idProduct);

    // Открытие устройства
    r = libusb_open(found_device, &handle);
    if (r < 0) {
        fprintf(stderr, "Ошибка открытия устройства: %s\n", libusb_error_name(r));
        libusb_free_device_list(devs, 1);
        libusb_exit(ctx);
        return 1;
    }

    libusb_free_device_list(devs, 1);

    // Отключение kernel driver
    for (int i = 0; i < 3; i++) {
        if (libusb_kernel_driver_active(handle, i)) {
            libusb_detach_kernel_driver(handle, i);
        }
        libusb_claim_interface(handle, i);
    }

    // Настройка устройства
    int lcr = CH341_LCR_ENABLE_RX | CH341_LCR_ENABLE_TX | CH341_LCR_CS8;
    if (configure_device(handle, speed, lcr, 0) < 0) {
        fprintf(stderr, "Ошибка настройки устройства\n");
        goto cleanup;
    }

    printf("Устройство готово к работе!\n");

    // Поиск endpoint
    struct libusb_config_descriptor *config;
    libusb_get_active_config_descriptor(found_device, &config);
    
    unsigned char out_endpoint = 0;
    for (int i = 0; i < config->interface->num_altsetting; i++) {
        const struct libusb_interface_descriptor *iface = &config->interface->altsetting[i];
        for (int j = 0; j < iface->bNumEndpoints; j++) {
            const struct libusb_endpoint_descriptor *ep = &iface->endpoint[j];
            if ((ep->bEndpointAddress & 0x80) == LIBUSB_ENDPOINT_OUT) {
                out_endpoint = ep->bEndpointAddress;
                break;
            }
        }
    }
    libusb_free_config_descriptor(config);

    if (out_endpoint == 0) {
        fprintf(stderr, "Не найден выходной endpoint\n");
        goto cleanup;
    }



// Установка обработчика сигналов
signal(SIGINT, signal_handler);

// Непрерывная отправка данных
printf("Начало непрерывной отправки данных. Нажмите Ctrl+C для остановки...\n");

const int count = 100000;
unsigned char* data = malloc(count);

for(int i = 0; i < count; i++) {
    data[i] = 0xaa;
}

int packetCount = 0;
long long totalBytesSent = 0;
long long bytesInLastSecond = 0;

// Переменные для измерения времени и скорости
time_t startTime, lastPrintTime, currentTime;
double totalElapsedSeconds;

// Переменные для расчета скорости за последнюю секунду
long long bytesAtLastSecond = 0;
time_t lastSecondTime;

time(&startTime);
lastPrintTime = startTime;
lastSecondTime = startTime;
bytesAtLastSecond = 0;

while (is_running && packetCount <= MAX_COUNT) {
    if (send_data(handle, out_endpoint, data, count) == 0) {
        packetCount++;
        totalBytesSent += count;
    }
    
    // Проверяем время для вывода статистики раз в секунду
    time(&currentTime);
    double elapsedSinceLastPrint = difftime(currentTime, lastPrintTime);
    
    if (elapsedSinceLastPrint >= 1.0) {
        // Рассчитываем скорость за последнюю секунду
        double elapsedSinceLastSecond = difftime(currentTime, lastSecondTime);
        if (elapsedSinceLastSecond > 0) {
            bytesInLastSecond = totalBytesSent - bytesAtLastSecond;
            double currentSpeed = bytesInLastSecond / elapsedSinceLastSecond;
            
            // Выводим статистику
            printf("Пакетов: %d, Отправлено: %.2f MB, Скорость: %.6f KB/s\n",
                   packetCount,
                   (double)totalBytesSent / (1024 * 1024),
                   currentSpeed / (1024));
        }
        
        lastPrintTime = currentTime;
        lastSecondTime = currentTime;
        bytesAtLastSecond = totalBytesSent;
    }
    
    // usleep(1000); // 1ms задержка
}

// Рассчитываем общую статистику
time(&currentTime);
totalElapsedSeconds = difftime(currentTime, startTime);

double averageSpeed = 0;
if (totalElapsedSeconds > 0) {
    averageSpeed = totalBytesSent / totalElapsedSeconds;
}

// Выводим итоговую статистику
printf("\n=== ИТОГОВАЯ СТАТИСТИКА ===\n");
printf("Всего отправлено пакетов: %d\n", packetCount);
printf("Общий объем данных: %.4f GB\n", (double)totalBytesSent / (1024 * 1024 * 1024));
printf("Общее время отправки: %.2f секунд\n", totalElapsedSeconds);
printf("Средняя скорость: %.2f MB/s\n", averageSpeed / (1024 * 1024));

// Выводим скорость за последнюю секунду, если была активность
if (bytesInLastSecond > 0) {
    double lastSecondSpeed = bytesInLastSecond / 1.0; // за 1 секунду
    printf("Скорость в последнюю секунду: %.2f MB/s\n", lastSecondSpeed / (1024 * 1024));
}

if (packetCount > MAX_COUNT) {
    printf("Достигнут лимит в %d пакетов. Останавливаем отправку...\n", MAX_COUNT);
}

printf("Отправка данных завершена.\n");
free(data);

cleanup:
    // Освобождение ресурсов
    if (handle) {
        for (int i = 0; i < 3; i++) {
            libusb_release_interface(handle, i);
        }
        libusb_close(handle);
    }
    libusb_exit(ctx);

    return 0;
}