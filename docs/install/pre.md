---
layout: default
title: Подготовка
parent: Установка
nav_order: 1
---
## Проверить запущены ли Postgres и ZooKeeper.
## Проверить, что в БД Postgres установлено расширение Postgis выполнив SQL запрос к этой БД:

```SELECT * FROM pg_available_extensions```

В выведенном списке расширейний должен быть postgis.
Если Postgis не установлен, то необходимо его установить выполнив SQL запрос:
CREATE EXTENSION postgis.
