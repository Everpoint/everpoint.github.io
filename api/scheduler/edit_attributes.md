---
layout: default
title: Калькулятор атрибутов
parent: Планировщик
grandparent: EverGIS API
nav_order: 10
---

# Калькулятор атрибутов
Чтобы создать задачу на расчёт значений атрибута, необходимо выполнить **POST**-запрос:
```
POST {host}/scheduler/tasks#type=editAttributes
```
<details>
<summary>JSON body</summary>

{% highlight json %}

{
  "condition": null,
  "attribute": "string",
  "editExpression": "string",
  "createNewAttribute": true,
  "attributeType": "Unknown",
  "target": {
    "serviceName": "string",
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
    }
  }
}

{% endhighlight %}
</details>

Калькулятор атрибутов позволяет рассчитывать значения атрибутов сразу всего слоя или таблицы на основе значений других атрибутов или геометрических характеристик с помощью EQL-выражения.

## Параметры
Чтобы создать задачу расчёта атрибута, необходимо в теле запроса указать следующие параметры:

- `target` - описание целевого ресурса, для которого рассчитываются атрибуты (**обязательный параметр**). [Подробнее об описаниях ресурсов](/api/scheduler/sources). *Как правило, задача расчёта атрибутов выполняется над слоями `layerTaskDataStorage`*;
- `attribute` - имя вычисляемого атрибута (**обязательный параметр**); <!-- проверить - обязательный только если createNewAttribute=true ??? -->
- `editExpression` - [EQL-выражение](/help/attr_query), на основе которого будут вычислены значения атрибута (**обязательный параметр**);
- `createNewAttribute` - создать новый атрибут (`true` или `false`). Если `true`, то вычисленные значения будут записаны в новый атрибут с указанным именем и типом. Если `false`, то вычисленные значения будут записаны в существующий атрибут с указанным именем. По умолчанию `false`;
- `attributeType` - тип вычисляемого атрибута. [Подробнее о типах данных](/api/resources/create_table#конфигурация-полей-таблицы). Указывается только в том случае, когда `createNewAttribute=true`;
- `condition` - [выражение](/help/attr_query) для фильтра объектов. Если дано выражение, то значения будут вычислены только для объектов, удовлетворяющих этому условию.

[Полный перечень и описание параметров создания задачи калькулятора атрибутов](https://evergis.ru/sp/docs/index.html#tag/SchedulerService/operation/SchedulerServiceController_StartCopyTask){:target="_blank"}

## Пример
Рассчитаем примерную высоту жилых многоквартирных домов в слое, созданном ранее в [примере](/api/resources/create_layer). Для этого умножим количество этажей `floors` домов, удовлетворяющих условию `purpose == "Многоквартирный дом"`, на среднюю высоту этажа - 2.7 м.

### Python
```python
import requests
import json
from pprint import pprint

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

serviceName = f'{username}.buildings_layer'
createNewService = False
target = {
    'type': 'layerTaskDataStorage',
    'serviceName': serviceName,
    'createNewService': createNewService
}

attribute = 'height'
attributeType = 'Double'
editExpression = 'floors * 2.7'
createNewAttribute = False
condition = "purpose == 'Жилой дом'"

editProps = {
    'target': target,
    'attribute': attribute,
    # 'attributeType': attributeType,
    'editExpression': editExpression,
    'createNewAttribute': createNewAttribute,
    'condition': condition
}

editTaskUrl = f'{host}/scheduler/tasks'
params={'type': 'editAttributes'}
headers = {'Content-type': 'application/json'}
taskProps = session.post(url=editTaskUrl, params=params, data=json.dumps(editProps), headers=headers).json()
taskProps
```
```
{'taskId': '3987bdd6-d3b4-4bc5-80e9-f0df68b1841c',
 'status': 'Scheduled',
 'taskResult': None}
```

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/scheduler/tasks#type=editAttributes
Content-Type: application/json
```
JSON body:
```json
{
    "target": {
        "type": "layerTaskDataStorage", 
        "serviceName": "username.buildings_layer", 
        "createNewService": false
    }, 
    "attribute": "height", 
    "editExpression": "floors * 2.7", 
    "createNewAttribute": false, 
    "condition": "purpose == 'Жилой дом'"
}
```