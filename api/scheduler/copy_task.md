---
layout: default
title: Копирование
parent: Планировщик
grandparent: EverGIS API
nav_order: 1
---

# Копирование
Копирование данных в EverGIS Online осуществляется с помощью задачи типа `type=copy`:
```
POST {host}/scheduler/tasks#type=copy
```
<details>
<summary>JSON body</summary>

{% highlight json %}

{
  "condition": null,
  "attributeMapping": {
    "property1": "string",
    "property2": "string"
  },
  "source": {
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
  },
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

## Параметры
Чтобы создать задачу копирования, необходимо в теле запроса указать следующие параметры:

- `source` - описание исходного ресурса, из которого будут скопированы данные (**обязательный параметр**). [Подробнее об описаниях ресурсов](/api/scheduler/sources). 
- `target` - описание целевого ресурса, в который будут скопированы данные (**обязательный параметр**);
- `attributeMapping` - сопоставление атрибутов исходного и целевого ресурса;
- `condition` - [выражение](/help/attr_query) для атрибутивной фильтрации копируемых объектов;

[Полный перечень и описание параметров создания задачи копирования](https://evergis.ru/sp/docs/index.html#tag/SchedulerService/operation/SchedulerServiceController_StartCopyTask){:target="_blank"}

### Сопоставление атрибутов
`attributeMapping` используется в случае, если в исходном и целевом ресурсе названия одного или нескольких атрибутов не совпадают. 
`attributeMapping` задаётся в виде JSON-объекта, где ключами являются названия атрибутов исходного ресурса, а значениями - названия соответствующих им атрибутов целевого ресурса:

```json
{
    "sourceAttr1": "targetAttr1",
    "sourceAttr2": "targetAttr2",
    "sourceAttr3": "targetAttr3",
    ...
}
```

## Пример
Скопируем в новый слой данные из слоя зданий, созданного в [примере](/api/resources/create_layer). При этом скопируем только те здания, которые были построены не ранее 2000 года и имеют не менее 5 этажей.

### Python
```python
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

# задаём имена и описания исходного и целевого слоёв
sourceName = f'{username}.buildings_layer'
targetName = f'{username}.buildings_layer_copy'

source = {
    'type': 'layerTaskDataStorage',
    'serviceName': sourceName
}

target = {
    'type': 'layerTaskDataStorage',
    'serviceName': targetName,
    'createNewService': True
}

# атрибутивный запрос
condition = "year >= #'2000-01-01T00:00:00.000+03:00' && floors >= 5"

copyProps = {
    'source': source,
    'target': target,
    'condition': condition
}

# выполнение запроса
copyTaskUrl = f'{host}/scheduler/tasks'
params={'type': 'copy'}
headers = {'Content-type': 'application/json'}
taskProps = session.post(url=copyTaskUrl, params=params, data=json.dumps(copyProps), headers=headers).json()
taskProps
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}

{'taskId': 'a248c545-8a15-4f67-b97d-bf5fbe61be9f',
 'status': 'Scheduled',
 'taskResult': None}

{% endhighlight %}

</details>

<br>

Проверим прогресс задачи:
```python
taskId = taskProps['taskId']
checkTaskUrl = f'{host}/scheduler/tasks/{taskId}/progress'

taskStatus = session.get(url = checkTaskUrl).json()
taskStatus
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}

{'id': 'a248c545-8a15-4f67-b97d-bf5fbe61be9f',
 'status': 'Completed',
 'taskResult': {'message': None,
  'stepResults': [{'stepName': None,
    'inputSource': None,
    'outSource': None,
    'startedTime': '2023-12-12T23:57:52.6243769Z',
    'endedTime': '2023-12-12T23:57:52.635895Z',
    'batchErrors': None,
    'batchCount': 1,
    'inputObjectCount': 0,
    'errorCount': 0,
    'outputObjectCount': 0,
    'resultDetails': None},
   {'stepName': None,
    'inputSource': None,
    'outSource': None,
    'startedTime': '2023-12-12T23:57:52.659113Z',
    'endedTime': '2023-12-12T23:57:52.6591355Z',
    'batchErrors': None,
    'batchCount': 1,
    'inputObjectCount': 0,
    'errorCount': 0,
    'outputObjectCount': 0,
    'resultDetails': None},
   {'stepName': None,
    'inputSource': None,
    'outSource': None,
    'startedTime': '2023-12-12T23:57:52.8735937Z',
    'endedTime': '2023-12-12T23:57:52.9378787Z',
    'batchErrors': None,
    'batchCount': 1,
    'inputObjectCount': 2,
    'errorCount': 0,
    'outputObjectCount': 2,
    'resultDetails': None}],
  'inputObjectCount': 2,
  'errorCount': 0,
  'outputObjectCount': 2},
 'stepCount': 0,
 'currentStepId': 0,
 'currentStepAlreadyDone': 0,
 'currentStepObjectCount': 0,
 'resultDetails': None}

{% endhighlight %}

</details>

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/scheduler/tasks#type=copy
Content-Type: application/json
```
JSON body:
```json
{
    "source": {
        "type": "layerTaskDataStorage", 
        "serviceName": "username.buildings_layer"
    }, 
    "target": {
        "type": "layerTaskDataStorage", 
        "serviceName": "username.buildings_layer_copy", 
        "createNewService": true
    }, 
    "condition": "year >= #\'2000-01-01T00:00:00.000+03:00\' && floors >= 5"
}
```