---
layout: default
title: Добавление объекта в слой
parent: Работа с объектами
grand_parent: EverGIS API
nav_order: 3
---

## Добавление объекта (здания) в существующий слой

### Предпосылки

Для выполнения этого примера предполагается, что у вас уже есть существующая таблица и слой в системе EverGIS. Таблица должна быть настроена для хранения данных о зданиях, а слой должен быть создан на основе этой таблицы.

### Пример кода на Python

Следующий пример кода показывает, как добавить здание в центр Москвы (Красная площадь) с заполненными атрибутами в существующий слой.

```python
import requests
import json

# Функция для авторизации и получения сессии
def login(username, password, host): 
    auth_url = f'{host}/account/login/'
    login_data = {
        "username": username,
        "password": password
    }
    headers = {'Content-Type': 'application/json'}
    session = requests.Session()
    response = session.post(url=auth_url, data=json.dumps(login_data), headers=headers)
    response.raise_for_status()
    return session

# Функция для добавления объекта (здания) в существующий слой
def add_building_to_layer(session, host, building_data):
    add_building_url = f'{host}/features'
    headers = {'Content-Type': 'application/json'}
    response = session.post(url=add_building_url, data=json.dumps(building_data), headers=headers)
    response.raise_for_status()
    return response.json()

# Параметры подключения
host = 'https://evergis.ru/sp'
username = 'your_username'
password = 'your_password'

# Авторизация и получение сессии
session = login(username, password, host)

# Данные для добавления здания
building_data = [
    {
        "layer": "your_layer_name",  # Укажите имя вашего существующего слоя
        "geometry": {
            "coordinates": [[
                [4183624.8, 7506766.5],
                [4183624.8, 7506866.5],
                [4183724.8, 7506866.5],
                [4183724.8, 7506766.5],
                [4183624.8, 7506766.5]
            ]],
            "sr": 3857,
            "type": "multipolygon"
        },
        "attributes": {
            "address": "Красная площадь, Москва",
            "purpose": "Коммерческое",
            "floors": 5,
            "year": "2024-01-01T00:00:00Z",
            "material": "Кирпич"
        }
    }
]

# Добавление здания в слой
add_building_response = add_building_to_layer(session, host, building_data)
print("Add Building to Layer Response:", add_building_response)
```