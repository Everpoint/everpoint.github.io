---
layout: default
title: Создание слоя
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 2
---

# Создание слоёв
Чтобы создать слой, нужно выполнить **POST**-запрос, содержащий параметры его создания:
```
POST {host}/layers#type=PostgresLayerService
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

Обязательными параметрами при создании слоя являются его уникальное системное имя `name` и конфигурация атрибутов `attributesConfiguration`.

## Системное имя слоя
Системное имя слоя строится аналогичным с именами таблиц образом и указывается в формате `namespace.name`, где `namespace` - пространство имён, в котором создаётся слой. В общем случае пространство имён совпадает с логином пользователя. Также слой может создаваться в пространетсве имён `temp`: `temp.name`. Такой слой является временным и будет удалён после завершения пользовательской сессии. Временные слои могут использоваться, к примеру, в качестве промежуточных этапов при расчётах с помощью [инструментов геообработки](/api/scheduler/spatial_tools). В название слоя `name` могут входить латинские буквы, цифры, а также символы `_$-.`

## Конфигурация атрибутов слоя
Конфигурация атрибутов `attributesConfiguration` задаётся json-объектом, описывающим параметры атрибутов слоя.

- `idAttribute` - атрибут, который будет использоваться в качестве идентификатора объектов (**обязательный параметр**). По умолчанию должен использоваться атрибут `gid`;
- `titleAttribute` - атрибут, значение которого будет использоваться в качестве заголовка в карточке объекта;
- `geometryAttribute` - атрибут геометрии слоя;
- `tableName` - системное имя таблицы (источника данных), на основе которой создаётся слой (**обязательный параметр**);
- `tableReferences` - список/массив json-объектов, описывающих атрибутивные связи с другими слоями или таблицами. [Подробнее об атрибутивных связях](/api/table_reference);
- `attributes` - список/массив json-объектов, описывающих атрибуты слоя.

### Описание атрибута
Каждое описание атрибута в списке `attributes` внутри `attributesConfiguration` состоит из параметров:

- `attributeName` - системное название атрибута (**обязательный параметр**). В названии допустимы латинские буквы, цифры и символ `_`;
- `columnName` - системное название поля исходной таблицы, на основе которого создаётся атрибут;
- `alias` - отображаемое в интерфейсе название атрибута (псевдоним);
- `subType` - как интерпретировать текст (для строковых атрибутов): 
    - `'None'` - как обычный текст;
    - `'Image'`- ссылка на изображение;
    - `'PkkCode'` - код ПКК;
- `isEditable` - разрешить редактирование значений атрибута (`true` или `false`);
- `isDisplayed` - отображать атрибут в карточке объекта (`true` или `false`);
- `aggregation` - функция агрегации для атрибутов, полученных с помощью атрибутивных связей; <!-- тоже непонятно -->
- `expression` - EQL-выражение для динамического вычисления значения атрибута; 
- `stringFormat` - json-объект, описывающий форматирование отображения значения слоя;

## Другие параметры создания слоя
Помимо обязательных параметров при создании слоя можно указать:
- `alias` - отображаемое в интерфейсе имя (псевдоним);
- `description` - текстовое описание слоя;
- `copyrightText` - информация о копирайте;
- `style` - настройки стиля слоя для визуализации. [Подробнее о стилях](/api/style/index);
- `condition` - фильтр для отбора объектов. [Подробнее о языке атрибутивных запросов](/help/attr_query);
- `acl` - Access Control List (описание настроек доступа к слою).

[Полный перечень и описание параметров создания слоя](https://evergis.ru/sp/docs/index.html#tag/Layers/operation/LayersController_PublishPostgresLayerService){:target="_blank"}

## Пример
Создадим полигональный слой зданий на основе таблицы, созданной ранее в [примере](/api/resources/create_table/#пример). 

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

# параметры создания слоя
tableName = f'{username}.buildings_table'
layerName = f'{username}.buildings_layer'
layerAlias = 'Здания'
layerDescription = 'Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки и материале'

attributesConfiguration = {
    "idAttribute": "gid",
    "geometryAttribute": "geometry",
    "tableName": tableName,
    "attributes":[
        {"attributeName": "gid", "columnName": "gid"},
        {"attributeName": "geometry", "columnName": "geometry"},
        {"attributeName": "address", "columnName": "address", "alias": "Адрес"},
        {"attributeName": "purpose", "columnName": "purpose", "alias": "Назначение"},
        {"attributeName": "floors", "columnName": "floors", "alias": "Количество этажей"},
        {"attributeName": "year", "columnName": "year", "alias": "Год постройки"},
        {"attributeName": "material", "columnName": "material", "alias": "Материал"},
    ]
}

layerProps = {
    "name": layerName,
    "alias": layerAlias,
    "description": layerDescription,
    "attributesConfiguration": attributesConfiguration
}

createLayerUrl = f'{host}/layers'
params = {"type": "PostgresLayerService"} # тип создаваемого ресурса

# выполнение запроса
r = session.post(url=createLayerUrl, params=params, data=json.dumps(layerProps), headers=headers).json()
```
В ответ на этот запрос, если он выполнен успешно, сервер вернёт JSON с полным описанием слоя, которые будет содежржать в том числе те параметры, значения которых не были указаны и были выбраны сервером по умолчанию.

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/layers#type=PostgresLayerService
Content-Type: application/json
```
JSON body:
```json
{
    "name": "username.buildings_layer", 
    "alias": "Здания", 
    "description": "Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки и материале", "attributesConfiguration": {
        "idAttribute": "gid", 
        "geometryAttribute": "geometry", 
        "tableName": "username.buildings_table", 
        "attributes": [
            {"attributeName": "gid", "columnName": "gid"}, 
            {"attributeName": "geometry", "columnName": "geometry"}, 
            {"attributeName": "address", "columnName": "address", "alias": "Адрес"}, 
            {"attributeName": "purpose", "columnName": "purpose", "alias": "Назначение"}, 
            {"attributeName": "floors", "columnName": "floors", "alias": "Количество этажей"}, 
            {"attributeName": "year", "columnName": "year", "alias": "Год постройки"}, 
            {"attributeName": "material", "columnName": "material", "alias": "Материал"}
        ]
    }
}
```

## Получение свойств слоя
Чтобы получить свойства слоя, достаточно выполнить **GET**-запрос с его системным именем:
```
GET {host}/layers/{name}
```

На примере только что созданного слоя:
```
layerInfoUrl = f'{host}/layers/{layerName}'
layerInfo = session.get(url=layerInfoUrl)
layerInfo
```
<details>
<summary>Просмотреть ответ сервера</summary>
{% highlight python %}
{'layerDefinition': {'idAttribute': 'gid',
  'titleAttribute': None,
  'geometryAttribute': 'geometry',
  'geometryType': 'polygon',
  'spatialReference': 3857,
  'isEditable': True,
  'attributes': {'gid': {'type': 'Int64',
    'alias': None,
    'isNullable': False,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None},
   'geometry': {'type': 'Polygon',
    'alias': None,
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None},
   'address': {'type': 'String',
    'alias': 'Адрес',
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None},
   'purpose': {'type': 'String',
    'alias': 'Назначение',
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None},
   'floors': {'type': 'Int32',
    'alias': 'Количество этажей',
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None},
   'year': {'type': 'DateTime',
    'alias': 'Год постройки',
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': {'scalingFactor': 0.0,
     'unitsLabel': None,
     'format': 'dd.MM.yyyy',
     'culture': None,
     'splitDigitGroup': False,
     'rounding': 0}},
   'material': {'type': 'String',
    'alias': 'Материал',
    'isNullable': True,
    'isEditable': True,
    'isDisplayed': True,
    'subType': 'None',
    'isUnique': False,
    'isCalculated': False,
    'stringFormat': None}}},
 'style': {'title': None,
  'condition': None,
  'symbol': {'type': 'polygonSymbol',
   'stroke': {'type': 'solid', 'color': '#00ffff80', 'width': 2.0},
   'fill': {'type': 'solid', 'color': '#00ffff80'},
   'disabled': False},
  'children': None,
  'minResolution': 0.0,
  'maxResolution': 0.0,
  'disabled': False},
 'dataSourceType': 'Table',
 'copyrightText': None,
 'type': 'PostgresLayerService',
 'minResolution': 0.0,
 'maxResolution': 0.0,
 'condition': None,
 'geometryType': 'polygon',
 'objectCount': 0,
 'categories': None,
 'configuration': {'attributesConfiguration': {'idAttribute': 'gid',
   'titleAttribute': None,
   'geometryAttribute': 'geometry',
   'tableName': 'username.buildings_table',
   'attributes': [{'attributeName': 'gid',
     'columnName': 'gid',
     'alias': None,
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None},
    {'attributeName': 'geometry',
     'columnName': 'geometry',
     'alias': None,
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None},
    {'attributeName': 'address',
     'columnName': 'address',
     'alias': 'Адрес',
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None},
    {'attributeName': 'purpose',
     'columnName': 'purpose',
     'alias': 'Назначение',
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None},
    {'attributeName': 'floors',
     'columnName': 'floors',
     'alias': 'Количество этажей',
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None},
    {'attributeName': 'year',
     'columnName': 'year',
     'alias': 'Год постройки',
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': {'scalingFactor': 0.0,
      'unitsLabel': None,
      'format': 'dd.MM.yyyy',
      'culture': None,
      'splitDigitGroup': False,
      'rounding': 0}},
    {'attributeName': 'material',
     'columnName': 'material',
     'alias': 'Материал',
     'subType': 'None',
     'isEditable': True,
     'isDisplayed': True,
     'aggregation': 'None',
     'expression': None,
     'stringFormat': None}],
   'tableReferences': None},
  'style': {'title': None,
   'condition': None,
   'symbol': {'type': 'polygonSymbol',
    'stroke': {'type': 'solid', 'color': '#00ffff80', 'width': 2.0},
    'fill': {'type': 'solid', 'color': '#00ffff80'},
    'disabled': False},
   'children': None,
   'minResolution': 0.0,
   'maxResolution': 0.0,
   'disabled': False},
  'condition': None,
  'featuresLimit': 500,
  'extentOffset': 0,
  'name': 'username.buildings_layer',
  'alias': 'Здания',
  'description': 'Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки и материале',
  'acl': {'data': [{'role': '__username',
     'permissions': 'read,write,configure'}]},
  'icon': None,
  'owner': 'username',
  'copyrightText': None,
  'tags': None,
  'invisibleInCatalog': False},
 'name': 'username.buildings_layer',
 'alias': 'Здания',
 'owner': 'username',
 'description': 'Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки и материале',
 'preview': None,
 'createdDate': '2023-11-29T11:49:30.4500244Z',
 'changedDate': '2023-11-29T11:49:30.4500245Z',
 'permissions': 'read,write,configure',
 'acl': {'data': [{'role': '__username',
    'permissions': 'read,write,configure'}]},
 'icon': None,
 'invisibleInCatalog': False}
{% endhighlight %}
</details>