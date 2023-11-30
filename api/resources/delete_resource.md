---
layout: default
title: Удаление ресурсов
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 7
---

# Удаление ресурсов

Для удаления любого вида ресурса (таблицы, слоя или карты) необходимо выполнить **DELETE**-запрос, в URL которого указано системное имя ресурса:
```
DELETE {host}/tables/{name}

DELETE {host}/layers/{name}

DELETE {host}/projects/{name}
```

<!-- можно добавить про метод на множественное удаление ресурсов, но он забагованный и после него имя удалённого ресурса будет пожизненно занято -->

## Пример

Для примера удалим созданные ранее [таблицу](/api/resources/create_table), [слой](/api/resources/create_layer) и [карту](/api/resources/create_map)

## URL
```
DELETE https://evergis.ru/sp/tables/username.buildings_table

DELETE https://evergis.ru/sp/layers/username.buildings_layer

DELETE https://evergis.ru/sp/layers/username.infrastructure_map
```

## Python
```python
import requests
import json

def login(username, password): # производит авторизацию и возвращает объект сессии
    authUrl = f'{host}/account/login/'
    login_data = {
        "username": username,
        "password": password
        }
    headers = {'Content-type': 'application/json'}

    # создание объекта сессии
    s = requests.Session()

    # авторизация и получение JWT-токена
    s.post(url=authUrl, data=json.dumps(login_data), headers=headers)

    return s

host = 'https://evergis.ru/sp'
username = 'username'
password = 'password'

# авторизация
session = login(username, password)

# URL запроса на удаление таблицы
tableName = f'{username}.buildings_table'
deleteTableUrl = f'{host}/tables/{tableName}'

# URL запроса на удаление слоя
layerName = f'{username}.buildings_layer'
deleteLayerUrl = f'{host}/layers/{layerName}'

# URL запроса на удаление карты
projectName = f'{username}.infrastructure_map'
deleteProjectUrl = f'{host}/projects/{projectName}'

# выполнение запросов
r1 = session.delete(url=deleteTableUrl)

r2 = session.delete(url=deleteLayerUrl)

r3 = session.delete(url=deleteProjectUrl)
```
