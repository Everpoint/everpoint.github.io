---
layout: default
title: Конфигурация
parent: Установка
---
## Описание конфигурационного файла SPCore.json
```json
{
  // максимальное число запросов обработываемых в одно время, при превышении 419 ошибка
  "maximumActiveRequests": 20,
  // порт развертывания системы
  "httpPort": 5051,

  // адрес ZooKeeper, если несколько мастер нод, то через запятую список адресов
  "zkConnectionAddress": "zk:2181",
  // адрес этого узла (пода) с помощью которого узлы будут общаться внутри кластера, порт из cloudConnectorPort
  "nodeAddress": "spcore:5050",
  // путь до всей статики системы (клиент и тд), не успользуется если указана конфигурация S3
  "staticPath": "/app/static",
  // путь где будут сохраняться все файлы для превью пользователя ( например ), не успользуется если указана конфигурация S3
  "previewStaticPath": "/app/static",
  // порт для подключения ZooKeeper
  "cloudConnectorPort": 5050,
  // Основой коннекшен стринг до базы Postgres 
  "dbConnectionString": "Server=db;Port=5432;User Id=postgres;Password=123;Database=postgis;Maximum Pool Size=25;",
  // настройки безопастности
  "securityManagerConfiguration": {

    // конфигурация токена
    "jwtConfiguration": {
      // ключ токена для шифрования, желательно больше 32 символов
      "tokenKey": "supersecrettoken",
      // токен админа, для быстрого доступа 
      "adminAccessToken": "supersecrettoken",
      // название куки для рефреш токена
      "refreshTokenCookie": "refreshToken",
      // название куки для jwt токена
      "jwtCookie": "jwt",
      // минут до устаревания JWT токена
      "minutesToExpireJwt": 10,
      // минут до устаревания рефреш токена
      "minutesToExpireRefreshToken": 1440
    }
  },
  // конфигурация SMTP сервера, для отправки писем системой
  "emailConfiguration": {
    "server": "",
    "port": 0,
    "name": "",
    "sender": "",
    "password": "",
    "SSL": true,
    "requireAuth": true
  },
  // конфигурация отправки фидбека
  "feedbackConfiguration": {
    "emailAddress": "",
    "slackChannelId": "",
    "telegramGroup": ""
  },
  // конфигурация слака  для отправки сообщений системой
  "slackConfiguration": {
    "userOAuthToken": ""
  },
  // конфигурация телеграма для отправки сообщений системой 
  "telegramConfiguration": {
    "botToken": ""
  },
  // конфигурация внешнего поставщика аутентификации VK, Google, Facebook, если надо параметры предоставим
  "oAuth": {
  },
  // Если true - сервер отвечает вместе с отладочной информацией
  "debugMode": true,

  // ДОПОЛНИТЕЛЬНО
  
  // внешний адрес системы, указывается в емеилах для восстановления пароля и тд
  "host": "http://evergis.ru",

  // Пароль суперюзера
  "suPassword": "123",

  // Емеил суперюзера
  "suEmail": "123@asd.ru",

  // Список доменов с которых можно будет подключиться и браузер не будет ругаться на CORS
  "corsOrigins": ["ya.ru", "google.com"],

  // конфигурация S3 хранилища
  "s3Configuration": {
    // хост, без протокола
    "host": "my-minio.example.com",
    // ключ доступа
    "accessKey": "",
    // секретный ключ
    "secretKey": "",
    // S3 custom region
    "region": "",
    // Имя бакета для статичных файлов
    "bucketName": "",
    // Имя бакета для хранения файлов сессии
    "sessionStorageBucketName":"",
    // Имя бакета для хранения превью
    "previewStorageBucketName":""
  }
}

```