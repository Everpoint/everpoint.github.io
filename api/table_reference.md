---
layout: default
title: Атрибутивные связи
parent: EverGIS API
nav_order: 5
---

# Атрибутивные связи
Атрибутивные связи в EverGIS Online позволяют присоединять к слою данные из других слоёв или таблиц по общему атрибуту без необходимости ручного копирования. Атрибутивные связи схожи с join-операциями в реляционных базах данных.


## Как создавать атрибутивные связи
Для задания атрибутивной связи слою при его [создании](/api/resources/create_layer) или [изменении](/api/resources/update_layer) необходимо внутри объекта `attributesConfiguration` задать параметры связи `tableReferences`. Этот объект представляет собой список/массив json-объектов, каждый из которых описывает отдельную атрибутивную связь и состоит из следующих параметров:

- `tableName` - системное имя таблицы, с которой осуществляется атрибутивная связь (**обязательный параметр**).
- `referenceColumn` - системное имя **поля исходной таблицы** (не атрибута слоя), по которому осуществляется атрибутивная связь (**обязательный параметр**).
- `targetColumn` - системное имя поля целевой таблицы, значения которого будут сопоставляться с `referenceColumn` исходной таблицы (**обязательный параметр**).
- `attributes` - список описаний присоединяемых атрибутов (**обязательный параметр**).
- `referenceId` - уникальный идентификатор атрибутивной связи (**обязательный параметр**).
- `joinType` - тип соединения таблиц: `"OneToOne"` или `"OneToMany"`. В общем случае его указывать не требуется, он определяется сервером автоматически.
- `condition` - [атрибутивный запрос](/help/attr_query) на фильтрацию объектов результирующего слоя. Необходим в случае, когда тип соединения `OneToMany` (одной записи исходной таблицы соответствуют несколько записей присоединяемой таблицы) и результирующий слой необходимо отфильтровать по одному или нескольким атрибутам.
- `tableReferences` - объект `tableReferences` для описания атрибутивных связей присоединяемой таблицы. Если они отсутствуют, остаётся пустым.

### Описания присоединяемых атрибутов
Список описаний присоединяемых атрибутов `attributes` строится по принципу, аналогичному [описаниям атрибутов при создании слоя](/api/resources/create_layer#описание-атрибута). Однако помимо стандартных параметров для присоединяемых атрибутов необходимо также указать:

- `referenceId` - идентификатор атрибутивной связи.
- `tableName` - системное имя таблицы, из которой присоединяются данные.

Если атрибутивная связь работает по принципу `"OneToMany"`, то к атрибуту можно применить одну из функций агрегации: `"Count"`, `"Min"`, `"Max"`, `"Avg"`, `"Sum"`.

Для корректного отображения в интерфейсе добавляемые с помощью связи атрибуты должны быть также добавлены в список `attributesConfiguration/attributes` [конфигурации атрибутов слоя](/api/resources/create_layer#конфигурация-атрибутов-слоя).

## Пример
Предположим, что мы имеем таблицу `username.points_tbl`, содержащую точки наблюдений трёх показателей: температуры воздуха, влажности воздуха и атмосферного давления. Она имеет следующую структуру:

| **Поле**   | **Тип данных** | **Назначение**                             |
|------------|----------------|--------------------------------------------|
| gid        | Int64          | Системный идентификатор                    |
| geometry   | Point          | Геометрия                                  |
| point_id   | Int64          | Уникальный идентификатор точки             |
| point_name | String         | Название точки                             |

Данные по измерениям в точках хранятся в отдельной таблице без геометрии `username.observations_tbl`:

| **Поле**    | **Тип данных** | **Назначение**          |
|-------------|----------------|-------------------------|
| gid         | Int64          | Системный идентификатор |
| point_id    | Int64          | Идентификатор точки     |
| temperature | Double         | Значение температуры    |
| humidity    | Double         | Значение влажности      |
| pressure    | Double         | Значение давления       |
| datetime    | DateTime       | Дата и время измерения  |

Каждая запись в этой таблице отражает значения трёх показателей в определённой точке в определённый момент времени.

Создадим на основе этих таблиц 3 отдельных слоя (по одному на каждый показатель), в которых будут отображаться значения этих показателей в определённую дату и время (например, 12:00 08.12.2023)

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
session = login(username, password)

# указываем связываемые таблицы
refTableName = f'{username}.points_tbl'
targetTableName = f'{username}.observations_tbl'

# поля, по которым будет осуществляться связь
referenceColumn = 'point_id'
targetColumn = 'point_id'

# прописываем конфигурацию создаваемых слоёв
layers = {
    'temperature': {
        'columnAlias': 'Температура',
        'unitsLabel': '°C',
        'layerProps': {
            'name': f'{username}.temperature_lyr',
            'alias': 'Температура воздуха 12:00 08.12.2023',
            'description': 'Значения температуры воздуха в точках наблюдений в 12:00 08.12.2023'
        }
    },
    'humidity': {
        'columnAlias': 'Влажность',
        'unitsLabel': '%',
        'layerProps': {
            'name': f'{username}.humidity_lyr',
            'alias': 'Влажность воздуха 12:00 08.12.2023',
            'description': 'Значения влажности воздуха в точках наблюдений в 12:00 08.12.2023'
        }
    },
    'pressure': {
        'columnAlias': 'Давление',
        'unitsLabel': 'мм. рт. ст.',
        'layerProps': {
            'name': f'{username}.pressure_lyr',
            'alias': 'Атмосферное давление 12:00 08.12.2023',
            'description': 'Значения атмосферного давления в точках наблюдений в 12:00 08.12.2023'
        }
    }
}

for meas, params in layers.items():
    
    referenceId = f'{meas}_ref'
    condition = "datetime == #'2023-12-08T12:00:00+03:00'"
    
    # создаём конфигурацию атрибутов текущего слоя
    attributesConfiguration = {
        "idAttribute": "gid",
        "geometryAttribute": "geometry",
        "tableName": refTableName,
        "attributes": [
            {"attributeName": "gid", "columnName": "gid"},
            {"attributeName": "geometry", "columnName": "geometry"},
            {"attributeName": "point_id", "columnName": "point_id", "alias": "Идентификатор точки"},
            {"attributeName": "point_name", "columnName": "point_name", "alias": "Название точки"}
        ],
        "tableReferences": [
            {
                "tableName": targetTableName,
                "referenceColumn": referenceColumn,
                "targetColumn": targetColumn,
                "attributes": [],
                "referenceId": referenceId,
                "condition": condition
            }
        ]
    }
    
    columnAlias = params['columnAlias']
    unitsLabel = params['unitsLabel']

    # добавляем присоединяемые атрибуты
    referenceAttributes = [
        {
            "attributeName": meas, 
            "columnName": meas, 
            "alias": columnAlias, 
            "referenceId": referenceId, 
            "tableName": targetTableName,
            "stringFormat": {
                "rounding": 0,
                "unitsLabel": unitsLabel
            }
        }, 
        {
            "attributeName": "datetime", 
            "columnName": "datetime", 
            "alias": "Дата и время", 
            "referenceId": referenceId, 
            "tableName": targetTableName
        }
    ]
    
    attributesConfiguration['tableReferences'][0]['attributes'] += referenceAttributes
    attributesConfiguration['attributes'] += referenceAttributes
    
    layerProps = params['layerProps'].copy()
    layerProps['attributesConfiguration'] = attributesConfiguration

    createLayerUrl = f'{host}/layers'
    params = {"type": "PostgresLayerService"}
    
    # выполняем запрос
    r = session.post(url=createLayerUrl, params=params, data=json.dumps(layerProps), headers=headers).json()
```