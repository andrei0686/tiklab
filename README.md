# Vuetify + vue 3 + Vite
experiments каталог для эксперементов

## backend

проект для серверной части уровни: 
- busines 
- service
- repository 
- database


## frontend 

- peresentation layer

для запуска разработки и отладки перейти в каталог frontend и запустите vite
```
npm run dev
```
для сборки dist в проекте выполниете 
```
npm run build
```

для просмотра версии node
```
nvm list
```
для пересключения версии node
```
nvm use v16.20.2  
или
nvm use v20.10.0
```
```
npm install express ws cors body-parser uuid
npm install --save-dev nodemon
```
- express – HTTP-сервер
- ws – WebSocket-сервер
- cors – обработка CORS
- uuid – генерация ID для тестов
- nodemon – автоматическая перезагрузка сервера