---
layout: default
title: Изменение таблицы
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 4
---

# Изменение таблицы
Для внесения изменений в свойства таблицы (добавление и удаление полей, изменение описания, параметров доступа) необходимо выполнить **PATCH**-запрос с параметрами изменения ресурса:

```
PATCH {host}/tables/{name}
Content-Type: application/json
```

<details>
<summary>JSON body</summary>

{% highlight json %}
{
  "columnsAdd": [
    {
      "name": "string",
      "defaultValue": null,
      "type": "Unknown",
      "maxLength": 0,
      "isNullable": true,
      "autoincrement": false,
      "srid": 0,
      "isUnique": true,
      "hasIndex": true
    }
  ],
  "columnsDelete": [
    "string"
  ],
  "rowCount": 0,
  "geometries": [
    "unknown"
  ],
  "type": "string",
  "configuration": {},
  "name": "string",
  "alias": "string",
  "owner": "string",
  "description": "string",
  "preview": "string",
  "createdDate": "2019-08-24T14:15:22Z",
  "changedDate": "2019-08-24T14:15:22Z",
  "permissions": "none",
  "acl": {
    "data": [
      {
        "role": "string",
        "permissions": "none"
      }
    ]
  },
  "icon": "string",
  "invisibleInCatalog": true
}
{% endhighlight %}
</details>

Новые значения изменяемых параметров, которые не относятся к полям таблицы, необходимо прописать в JSON-теле запроса. Добавление и удаление полей производится с помощью параметров `columnsAdd` и `columnsDelete`. Изменение свойств существующих полей не поддерживается.

Конфигурация добавляемых полей `columnsAdd` представляет собой массив/список JSON-объектов и содержит следующие параметры:

- `name` - уникальное название поля (**обязательный параметр**). Может содержать латинские буквы, цифры и символ `_`;
- `defaultValue` - значение по умолчанию;
- `type` - тип данных поля (**обязательный параметр**). Допустимые значения: `String`, `Int32`, `Int64`, `Double`, `DateTime`, `Boolean`, `Point`, `Polyline`, `Polygon`, `Multipoint`;
- `maxLength` - максимальная длина поля;
- `isNullable` - допускаются ли пустые значения (`true` или `false`);
- `autoincrement` - автоматическое приращение для `Int32` и `Int64` полей (`true` или `false`);
- `srid` - система координат для полей геометрии (EPSG-код, например, 4326 - WGS84 или 3857 - Web Mercator WGS84);
- `isUnique` - проверять значения поля на уникальность (`true` или `false`);
- `hasIndex` - индексировать поле (`true` или `false`).

Перечень удаляемых полей `columnsDelete` представляет собой массив/список строк, содержащих системные имена удаляемых полей.

## Пример
Изменим [созданную ранее](/api/resources/create_table/#пример) таблицу зданий, добавив в неё новые поля количества квартир и организаций и удалив поле материала здания. Также изменим описание таблицы.

### Python
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
headers = {'Content-type': 'application/json'}

# авторизация
s = login(username, password)

# описание изменений в таблице
tableName = f'{username}.buildings_table'
tableDescription = 'Здания с информацией об адресе, назначении, количестве этажей, годе постройки, количестве квартир и организаций'
tableColumnsAdd = [
    {"name": "aprtCount", "type": "Int32"},
    {"name": "firmCount", "type": "Int32"}
]
tableColumnsDelete = ["material"]

tableUpdateProps = {
    "name": tableName,
    "description": tableDescription,
    "columnsAdd": tableColumnsAdd,
    "columnsDelete": tableColumnsDelete
}

updateTableUrl = f'{host}/tables/{tableName}'
# выполнение PATCH-запроса
r = s.patch(url=updateTableUrl, data=json.dumps(tableUpdateProps), headers=headers).json()
```

### URL и JSON запроса

_Для работы с запросом в Postman или аналогичном приложении_

```
PATCH https://evergis.ru/sp/tables/username.buildings_table
Content-Type: application/json
```
JSON body:
```json
{
    "name": "username.buildings_table",
    "description": "Здания с информацией об адресе, назначении, количестве этажей, годе постройки, количестве квартир и организаций",
    "columnsAdd": [
        {"name": "aprtCount", "type": "Int32"},
        {"name": "firmCount", "type": "Int32"}
    ],
    "columnsDelete": ["material"]
}
```
