---
layout: default
title: Загрузка в растровый каталог
parent: Планировщик
grand_parent: EverGIS API
nav_order: 15
---

# Загрузка в растровый каталог
Для загрузки файлов в растровый каталог необходимо выполнить **POST**-запрос:
```
POST {host}/scheduler/tasks#type=tiling
Content-Type: application/json
```
<details>
<summary>JSON body</summary>

{% highlight json %}

{
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
  },
  "files": [
    "string"
  ],
  "attributes": {
    "property1": null,
    "property2": null
  },
  "maxZoomLevel": 0,
  "polygonize": true,
  "useCog": true
}

{% endhighlight %}
</details>

## Параметры

- `target` - описание целевого ресурса, в который будут скопированы данные (**обязательный параметр**). [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `files` - список/массив названий загружаемых файлов во временном хранилище (**обязательный параметр**). [Подробнее о загрузке файлов](/api/data_upload#авторизация-и-загрузка-файла);
- `attributes` - значения атрибутов для загружаемых файлов;
- `polygonize` - извлечь геометрию по границе пикселей растра (`true` или `false`). Если `true`, ограничивающий полигон растра будет извлечён исходя из границ непустых значений растра. Если `fale`, ограничивающим полигоном будет его *bbox*.
- `useCog` - привести растр к виду Cloud Optimized GeoTIFF (`true` или `false`). Рекомендуется использовать эту опцию.
- `maxZoomLevel` - количество уровней детализации для Cloud Optimized GeoTIFF.

### Описание атрибутов растра
Параметр загрузки растра `attributes` представляет собой JSON-объект, ключами которого являются названия атрибутов растрового каталога. Этим ключам сопоставляются значения атрибутов, которые будут присвоены загружаемым файлам. К примеру, если растровый каталог со спутниковыми снимками имеет атрибуты `name` (название снимка) и `dateofimage` (дата съёмки), объект `attributes` для загружаемого растра может выглядеть следующим образом:
```json
{
    "name": "Снимок Landsat-8",
    "dateofimage": "2023-12-08T12:00:00+00:00"
}
```

Если в `files` указано несколько файлов для загрузки, им всем будут присвоены одинаковые значения атрибутов, указанные в `attributes`. Поэтому в большинстве случаев для загрузки нескольких файлов целесообразно использовать отдельные запросы.

## Пример
Загрузим растровый файл `landsat_test_image.tif` из временного хранилища в растровый каталог `username.landsat_images`. 

[Подробнее о том, как загрузить файл в хранилище](/api/data_upload#авторизация-и-загрузка-файла).

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

# авторизация
session = login(username, password)

# определяем параметры для задачи копирования
files = ["landsat_test_image.tif"]
attributes = {
    "name": "Снимок Landsat-8",
    "dateofimage": "2023-12-08T12:00:00+00:00"
}
polygonize = False

serviceName = f"{username}.landsat_images"

target = {
    "type": "tileFeatureLayerTaskDataStorage",
    "serviceName": serviceName,
    "createNewService": False
}

useCog = True

tilingProps = {
    "files": files,
    "attributes": attributes,
    "polygonize": polygonize,
    "target": target,
    "useCog": useCog
}

# выполнение запроса
tilingTaskUrl = f'{host}/scheduler/tasks'
params={'type': 'tiling'}
headers = {'Content-type': 'application/json'}
taskProps = session.post(url=tilingTaskUrl, params=params, data=json.dumps(tilingProps), headers=headers).json()
taskProps
```
```
{'taskId': '91126928-4189-4c20-890a-fc5c56001d26',
 'status': 'Scheduled',
 'taskResult': None}
```

Проверяем статус задачи:
```python
taskId = taskProps['taskId']
checkTaskUrl = f'{host}/scheduler/tasks/{taskId}/progress'

taskStatus = session.get(url = checkTaskUrl, headers=headers).json()
taskStatus
```
```
{'id': '91126928-4189-4c20-890a-fc5c56001d26',
 'status': 'Completed',
 'taskResult': {'message': None,
  'stepResults': [{'stepName': None,
    'inputSource': None,
    'outSource': None,
    'startedTime': '2023-12-18T01:08:18.0832029Z',
    'endedTime': '2023-12-18T01:08:26.4759883Z',
    'batchErrors': None,
    'batchCount': 1,
    'inputObjectCount': 1,
    'errorCount': 0,
    'outputObjectCount': 1,
    'resultDetails': {'Tiles created': 97}}],
  'inputObjectCount': 1,
  'errorCount': 0,
  'outputObjectCount': 1},
 'stepCount': 0,
 'currentStepId': 0,
 'currentStepAlreadyDone': 0,
 'currentStepObjectCount': 0,
 'resultDetails': None}
```

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/scheduler/tasks#type=tiling
Content-Type: application/json
```
JSON body:
```json
{
    "files": ["landsat_test_image.tif"], 
    "attributes": {
        "name": "Снимок Landsat-8", 
        "dateofimage": "2023-12-08T12:00:00+00:00"
    }, 
    "polygonize": false, 
    "target": {
        "type": "tileFeatureLayerTaskDataStorage", 
        "serviceName": "username.landsat_images", 
        "createNewService": false
    }
}
```