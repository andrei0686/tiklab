


запуск генерации документации
`jsdoc .\iPortConnector.js -d .\docs\`

если не сработает тогда через npx
создать файл jsdoc.json в котором указать пути к файлам и выходной папке

```
{
    "source": {
        "include": [
            "./iPortConnector.js"
        ]
    },
    "opts": {
        "destination": "./docs"
    }
}
```

и запустить:
 `npx jsdoc -c .\jsdoc.json`

 если возникает ошибка доступа при запуске (в windows), тогда сначало разрешить доступ так 

 `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`