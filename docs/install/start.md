---
layout: default
title: Запуск
parent: Установка
nav_order: 2
---
## Загрузить образ серверного приложения в репозиторий докера
```docker load -i /evergis/spcore.tar```
## Запустить контейнер из образа выполнив:
```docker run переменные_окружения порты тома spcore:latest dotnet SPCore.App.Public.dll дополнительные_команды```

**порты**, открываются командой –p внешний_порт:порт_контейнера :

* 5051 – основной порт приложения
* 5050 – указывается только, если система запускается в режиме кластера ( несколько инстансов серверного приложения)

**переменные_окружения**, указываются командой -e :

Основные:
* SPCORE_SuEmail - емеил суперпользователя
* SPCORE_SuPassword – пароль супер пользователя
* SPCORE_dbConnectionString – строка подключения к БД Postgres
* SPCORE_host – публичный URL приложения 
* SPCORE_zkConnectionAddress – адрес ZooKeeper для координации приложений
* SPCORE_nodeAddress – адрес приложения – с портом указанным в SPCORE_cloudConnectorPort
* SPCORE_cloudConnectorPort – порт для подключения других приложений в кластере


Дополнительные переменные окружения описаны в конфигурационном файле SPCore.json, при переводе параметров конфигурации в переменные окружения должен указываться префикс SPCORE_, вложенные переменные JSON указываются через знак двойного подчеркивания ( __ ), например: параметр emailConfiguration.server в SPCORE_emailConfiguration__server.

**тома**  

Дополнительно можно указать пути к логам, статичным файлам, например:

```console
-v  $HOME/app/logs:/app/logs
-v  $HOME/app/static:/app/static
-v  $HOME/app/static_doc:/app/static_doc
-v  $HOME/app/static_preview:/app/static_preview
```

(без указания все это будет писаться внутрь контейнера и при перезапуске будет удалено)

**дополнительные_команды**: 

`--updateDb=true `

Указывается, если приложение запускается первый раз на чистой БД без необходимых таблиц и необходимо применить миграции, которые создадут таблицы.

`--resetCluster=true`

Сброс кластера ZooKeeper

`--continue=true`

Продолжить работу после выполнения команд

Пример первого запуска приложения на URL *localhost:5051* с логином/паролем суперюзера *admin@mail.ru/123123123*,  в кластерном режиме (zookeeper расположен по URL *zk:2181*), БД расположенной на том же сервере (вне докера), с применением миграций :

```console
docker run  -e SPCORE_host='http://localhost:5051' -e SPCORE_SuEmail=admin@mail.ru -e SPCORE_SuPassword=123123123 -e SPCORE_dbConnectionString='Server=host.docker.internal;Port=5432;User Id=postgres;Password=123123123;Database=evergis;Maximum Pool Size=25;'  -e SPCORE_zkConnectionAddress='zk:2181'  -e SPCORE_nodeAddress='spcore:5050'  -p 5051:5051  -p 5050:5050 spcore:latest dotnet SPCore.App.Public.dll --updateDb=true --resetCluster=true --continue=true
```

Для теста работоспособности ввести в браузере http://localhost:5051/, система должно ответить служебным сообщением:

```console
{"serverName":"Spatial Processing Core","application":"Public","version":"0.6.0","routingProviders":[],"startedAt":"2022-02-19T16:42:42.3787309+00:00"}
```

Для повторного запуска (когда БД и ZooKeeper подготовлены) можно использовать команду:

```console
docker run  -e SPCORE_host='http://localhost:5051' -e SPCORE_dbConnectionString='Server=host.docker.internal;Port=5432;User Id=postgres;Password=123123123;Database=evergis;Maximum Pool Size=25;'  -e SPCORE_zkConnectionAddress='zk:2181'  -e SPCORE_nodeAddress='localhost:5050'  -p 5051:5051  -p 5050:5050 spcore:latest dotnet SPCore.App.Public.dll --restart on-failure
```

