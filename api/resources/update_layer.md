---
layout: default
title: Изменение слоя
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 5
---

# Изменение слоя
Для внесения изменений в свойства слоя (добавление и удаление атрибутов, изменение описания, параметров доступа) необходимо выполнить **PATCH**-запрос с новыми параметрами слоя:
```
PATCH {host}/layers/{name}#type=PostgresLayerService
Content-Type: application/json
```
<details>
<summary>JSON body</summary>

{% highlight json %}
{
    "attributesConfiguration": {
        "idAttribute": "string",
        "titleAttribute": "string",
        "geometryAttribute": "string",
        "tableName": "string",
        "attributes": [
        {
            "attributeName": "string",
            "columnName": "string",
            "alias": "string",
            "subType": "None",
            "isEditable": true,
            "isDisplayed": true,
            "aggregation": "None",
            "expression": "string",
            "stringFormat": {
            "scalingFactor": 0,
            "unitsLabel": "string",
            "format": "string",
            "culture": "string",
            "splitDigitGroup": true,
            "rounding": 0
            }
        }
        ],
        "tableReferences": [
        {
            "tableName": "string",
            "referenceColumn": "string",
            "targetColumn": "string",
            "attributes": [
            {
                "attributeName": "string",
                "columnName": "string",
                "alias": "string",
                "subType": "None",
                "isEditable": true,
                "isDisplayed": true,
                "aggregation": "None",
                "expression": "string",
                "stringFormat": {
                "scalingFactor": 0,
                "unitsLabel": "string",
                "format": "string",
                "culture": "string",
                "splitDigitGroup": true,
                "rounding": 0
                }
            }
            ],
            "tableReferences": [
            {}
            ]
        }
        ]
    },
    "style": {
        "title": "string",
        "condition": "string",
        "symbol": {
        "size": {
            "expression": "string",
            "defaultValue": 0
        },
        "fillColor": {},
        "strokeColor": {},
        "strokeWidth": {
            "expression": "string",
            "defaultValue": 0
        },
        "offset": [
            {
            "expression": "string",
            "defaultValue": 0
            }
        ],
        "angle": {
            "expression": "string",
            "defaultValue": 0
        },
        "disabled": true
        },
        "children": [
        {}
        ],
        "minResolution": 0,
        "maxResolution": 0,
        "disabled": true
    },
    "condition": "string",
    "featuresLimit": 0,
    "extentOffset": 0,
    "name": "string",
    "alias": "string",
    "description": "string",
    "acl": {
        "data": [
        {
            "role": "string",
            "permissions": "none"
        }
        ]
    },
    "icon": "string",
    "owner": "string",
    "copyrightText": "string",
    "tags": [
        "string"
    ],
    "invisibleInCatalog": true
}
{% endhighlight %}

</details>

Обязательными параметрами при изменении состояния слоя являются его уникальное системное имя `name` и конфигурация атрибутов `attributesConfiguration`, которая строится так же, как и при [создании слоя](/api/resources/create_layer).

Новое значение каждого параметра полностью перезаписывает старое, следовательно, если необходимо, к примеру, добавить атрибуты в `attributesConfiguration`, необходимо добавить их к списку уже имеющихся атрибутов. Для внесения точечных изменений целесообразно сначала получить текущее состояние ресурса с помощью **GET**-запроса, изменить необходимые значения в JSON, а затем выполнить **PATCH**-запрос с изменёнными параметрами.

## Пример 
Изменим [созданный ранее](/api/resources/create_layer/#пример) слой в соответствии с [изменениями его исходной таблицы](/api/resources/update_table/#пример): добавим атрибуты количества квартир и организаций, удалим атрибут материала здания и отредактируем описание.

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
username = 'username'
password = 'password'
headers = {'Content-type': 'application/json'}

# авторизация
session = login(username, password)

tableName = f'{username}.buildings_table'
layerName = f'{username}.buildings_layer'
layerDescription = 'Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки, количестве квартир и организаций'

# получение текущего состояния слоя
layerInfoUrl = f'{host}/layers/{layerName}'
params = {"type": "PostgresLayerService"} # тип ресурса
layerProps = session.get(url=layerInfoUrl, params=params).json()

# изменение конфигурации слоя 
layerUpdateProps = layerProps['configuration']

oldAttributes = layerUpdateProps['attributesConfiguration']['attributes']

addedAttributes = [
    {"attributeName": "aprtCount", "columnName": "aprtCount", "alias": "Количество квартир"},
    {"attributeName": "firmCount", "columnName": "firmCount", "alias": "Количество организаций"},
]

updatedAttributes = [a for a in oldAttributes if a['attributeName'] != 'material'] + addedAttributes

layerUpdateProps['attributesConfiguration']['attributes'] = updatedAttributes
layerUpdateProps['description'] = layerDescription

# выполнение PATCH-запроса
r = session.patch(url=layerInfoUrl, data=json.dumps(layerUpdateProps), params=params, headers=headers).json()
```
### URL и JSON запроса
_Для работы с запросом в Postman или аналогичном приложении_

```
PATCH https://evergis.ru/sp/layers/username.buildings_layer#type=PostgresLayerService
Content-Type: application/json
```
JSON body:
```json
{
    "attributesConfiguration": {
        "idAttribute": "gid", 
        "titleAttribute": null, 
        "geometryAttribute": "geometry", 
        "tableName": "username.buildings_table",
        "attributes": [
            {
                "attributeName": "gid", "columnName": "gid", "alias": null, 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": null
            }, 
            {
                "attributeName": "geometry", "columnName": "geometry", "alias": null, 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": null
            }, 
            {
                "attributeName": "address", "columnName": "address", "alias": "Адрес", 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": null
            }, 
            {
                "attributeName": "purpose", "columnName": "purpose", "alias": "Назначение", 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": null
            }, 
            {
                "attributeName": "floors", "columnName": "floors", "alias": "Количество этажей", 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": null
            }, 
            {
                "attributeName": "year", "columnName": "year", "alias": "Год постройки", 
                "subType": "None", "isEditable": true, "isDisplayed": true, 
                "aggregation": "None", "expression": null, "stringFormat": {
                    "scalingFactor": 0.0, "unitsLabel": null, "format": "dd.MM.yyyy", 
                    "culture": null, "splitDigitGroup": false, "rounding": 0
                }
            }, 
            {"attributeName": "aprtCount", "columnName": "aprtCount", "alias": "Количество квартир"}, 
            {"attributeName": "firmCount", "columnName": "firmCount", "alias": "Количество организаций"}
        ], 
        "tableReferences": null
    }, 
    "style": {
        "title": null, "condition": null, "symbol": {
            "type": "polygonSymbol", 
            "stroke": {"type": "solid", "color": "#00ffff80", "width": 2.0}, 
            "fill": {"type": "solid", "color": "#00ffff80"}, 
            "disabled": false
        }, 
        "children": null, 
        "minResolution": 0.0, 
        "maxResolution": 0.0, 
        "disabled": false
    }, 
    "condition": null, 
    "featuresLimit": 500, 
    "extentOffset": 0, 
    "name": "username.buildings_layer", 
    "alias": "Здания", 
    "description": "Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки, количестве квартир и организаций", 
    "acl": {"data": [{"role": "__username", "permissions": "read,write,configure"}]}, 
    "icon": null, 
    "owner": "username", 
    "copyrightText": null, 
    "tags": null, 
    "invisibleInCatalog": false
}
```