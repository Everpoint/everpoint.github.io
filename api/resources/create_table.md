---
layout: default
title: Создание таблицы
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 1
---

# Создание таблиц
Чтобы создать таблицу (источник данных), нужно выполнить **POST**-запрос, содержащий параметры её создания:
```
POST {host}/tables
Content-Type: application/json
```
<details>
<summary>JSON body</summary>
{% highlight json %}
{
  "columns": [
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

Обязательными параметрами при создании таблицы являются её уникальное системное имя `name` и конфигурация полей `columns`. Помимо этого в большинстве случаев указывается параметр типа геометрии `geometries`.

## Системное имя таблицы
Системное имя указывается в формате `"namespace.name"`, где `namespace` - пространство имён, в котором создаётся таблица. Как правило, оно совпадает с логином пользователя. В название таблицы могут входить латинские буквы, цифры, а также символы `_$-.`

## Тип геометрии
Если таблица должна содержать пространственные данные, необходимо указать тип геометрии (параметр `geometries`):
- `"point"` - точки;
- `"polyline"` - линии;
- `"polygon"` - полигоны;
- `"envelope"` - ограничивающий прямоугольник;
- `"multipoint"` - мультиточки.

Если не указывать этот параметр или присвоить ему значения `null` или `"unknown"`, таблица будет создана без геометрии и сможет хранить лишь семантические данные без пространственной привязки.

## Конфигурация полей таблицы
Конфигурация полей `columns` представляет собой массив (список) json-объектов, описывающих каждое поле создаваемой таблицы. Каждое из описаний полей может содержать следующие параметры:

- `name` - уникальное название поля (**обязательный параметр**). Может содержать латинские буквы, цифры и символ `_`;
- `defaultValue` - значение по умолчанию;
- `type` - тип данных поля (**обязательный параметр**). Допустимые значения: `String`, `Int32`, `Int64`, `Double`, `DateTime`, `Boolean`, `Point`, `Polyline`, `Polygon`, `Multipoint`;
- `maxLength` - максимальная длина поля;
- `isNullable` - допускаются ли пустые значения (`true` или `false`);
- `autoincrement` - автоматическое приращение для `Int32` и `Int64` полей (`true` или `false`);
- `srid` - система координат для полей геометрии (EPSG-код, например, 4326 - WGS84 или 3857 - Web Mercator WGS84);
- `isUnique` - проверять значения поля на уникальность (`true` или `false`);
- `hasIndex` - индексировать поле (`true` или `false`).

**Важно**: при создании любой таблицы всегда необходимо включать в конфигурацию полей системное поле `gid` с параметрами:
```json
{
    "name": "gid",
    "type": "Int64", 
    "isNullable": false, 
    "isUnique": true, 
    "autoincrement": true
}
```

Если таблица предназначается для пространственных данных, она должна иметь поле геометрии `geometry`:
```json
{
    "name": "geometry",
    "type": "Point", 
    "srid": 3857, 
}
```

## Другие параметры создания таблицы
Помимо обязательных параметров и геометрии для таблицы можно указать:
- `type` - тип таблицы. `Table` (по умолчанию) - обычная таблица, `TileCatalogTable` - растровый каталог;
- `alias` - отображаемое в интерфейсе имя;
- `description` - текстовое описание таблицы;
- `acl` - Access Control List (описание настроек доступа к таблице).

[Полное перечень и описание параметров создания таблицы](https://evergis.ru/sp/docs/index.html#tag/Tables/operation/TablesController_CreateTable){:target="_blank"}

## Пример
Создадим таблицу зданий с полигональной геометрией, содержащую информацию об адресе, назначении здания, количестве этажей, годе постройки, материале.

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
    # создание объекта сессии
    s = requests.Session()
    # авторизация и получение JWT-токена
    s.post(url=authUrl, data=json.dumps(login_data), headers=headers)
    return s

host = 'https://evergis.ru/sp'
createTableUrl = f'{host}/tables'
username = 'username'
password = 'password'
headers = {'Content-type': 'application/json'}

# авторизация
session = login(username, password)

# описание параметров создания таблицы
tableName = f'{username}.buildings_table' # название ресурса добавляется к имени пользователя через точку
tableAlias = 'Здания'
tableDescription = 'Здания с информацией об адресе, назначении, количестве этажей, годе постройки и материале'
tableColumns = [
    {"name": "gid", "type": "Int64", "isNullable": False, "isUnique": True, "autoincrement": True},
    {"name": "geometry", "type": "Polygon", "srid": 3857},
    {"name": "address", "type": "String"},
    {"name": "purpose", "type": "String"},
    {"name": "floors", "type": "Int32"},
    {"name": "year", "type": "DateTime"},
    {"name": "material": "type": "String"}
]

tableProps = {
    "name": tableName,
    "alias": tableAlias,
    "description": tableDescription,
    "columns": tableColumns
}

# выполнение запроса
r = session.post(url=createTableUrl, data=json.dumps(tableProps), headers=headers).json()
```
В ответ на этот запрос, если он выполнен успешно, сервер вернёт JSON с полным описанием таблицы, в том числе с параметрами, значения которых не были указаны и были выбраны сервером по умолчанию.

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/tables
Content-Type: application/json
```
JSON body:
```json
{
    "name": "username.buildings_table", 
    "alias": "Здания", 
    "description": "Здания с информацией об адресе, назначении, количестве этажей, годе постройки и материале",
    "columns": [
        {"name": "gid", "type": "Int64", "isNullable": false, "isUnique": true, "autoincrement": true}, 
        {"name": "geometry", "type": "Polygon", "srid": 3857}, 
        {"name": "address", "type": "String"}, 
        {"name": "purpose", "type": "String"}, 
        {"name": "floors", "type": "Int32"}, 
        {"name": "year", "type": "DateTime"}, 
        {"name": "material", "type": "String"}
    ]
}
```

## Получение свойств таблицы
Чтобы получить свойства таблицы, достаточно выполнить **GET**-запрос с её системным именем:
```
GET {host}/tables/{name}
```

На примере только что созданной таблицы:
```
tableInfoUrl = f'{host}/tables/{tableName}'
tableInfo = session.get(url=tableInfoUrl)
tableInfo
```
<details>
<summary>Просмотреть ответ сервера</summary>
{% highlight python %}
{'columns': [{'name': 'gid',
   'defaultValue': None,
   'type': 'Int64',
   'maxLength': None,
   'isNullable': False,
   'autoincrement': True,
   'srid': None,
   'isUnique': False,
   'hasIndex': True},
  {'name': 'geometry',
   'defaultValue': None,
   'type': 'Polygon',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': 3857,
   'isUnique': False,
   'hasIndex': True},
  {'name': 'address',
   'defaultValue': None,
   'type': 'String',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': None,
   'isUnique': False,
   'hasIndex': False},
  {'name': 'purpose',
   'defaultValue': None,
   'type': 'String',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': None,
   'isUnique': False,
   'hasIndex': False},
  {'name': 'floors',
   'defaultValue': None,
   'type': 'Int32',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': None,
   'isUnique': False,
   'hasIndex': False},
  {'name': 'year',
   'defaultValue': None,
   'type': 'DateTime',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': None,
   'isUnique': False,
   'hasIndex': False},
  {'name': 'material',
   'defaultValue': None,
   'type': 'String',
   'maxLength': None,
   'isNullable': True,
   'autoincrement': False,
   'srid': None,
   'isUnique': False,
   'hasIndex': False}],
 'rowCount': 0,
 'geometries': ['polygon'],
 'type': 'Table',
 'configuration': {'type': 'defaultTableConfiguration'},
 'name': 'username.buildings_table',
 'alias': 'Здания',
 'owner': 'username',
 'description': 'Здания с информацией об адресе, назначении, количестве этажей, годе постройки и материале',
 'preview': None,
 'createdDate': '2023-11-29T11:21:11.9558Z',
 'changedDate': '2023-11-29T11:21:11.9558Z',
 'permissions': 'read,write,configure',
 'acl': {'data': [{'role': '__username',
    'permissions': 'read,write,configure'}]},
 'icon': None,
 'invisibleInCatalog': False}
{% endhighlight %}
</details>