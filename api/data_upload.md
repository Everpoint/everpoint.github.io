---
layout: default
title: Загрузка данных
parent: EverGIS API
nav_order: 20
---

# Загрузка данных

Загрузка данных из файлов в EverGIS производится в несколько этапов, каждому из которых соответствует отдельный запрос:

1. Загрузка файла одного из поддерживаемых форматов на сервер и создание временного хранилища
2. Получение считанной сервером структуры файла (`dataSchema`)
3. Создание пустой таблицы в соответствии с `dataSchema`
4. Создание слоя на основе созданной таблицы
5. Копирование данных из временного хранилища в слой

Альтернативные варианты загрузки данных:
1. Копирование данных из временного хранилища в таблицу без создания слоя.
2. Дозагрузка данных в уже существующие слой/таблицу без создания новых.

## Пример
Рассмотрим полный процесс загрузки данных в систему с использованием Python и requests на примере [Shape-файла](/demo/road_density.zip) плотности уличной сети Москвы в гексагональных ячейках. Для загрузки Shape-файла его необходимо заархивировать в формате .zip.

### Авторизация и загрузка файла
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

filePath = 'data/road_density.zip'
uploadFileUrl = f'{host}/upload/file'
headers = {'Accept': '*/*'}

# загрузка файла в хранилище
with open(filePath, 'rb') as f:
    files = {"file": f}
    data = {'rewrite': True}
    fileProps = session.post(url=uploadFileUrl, files=files, data=data, headers=headers).json()

fileProps
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}

{'fileId': 'road_density.zip', 
 'url': None}

{% endhighlight %}

</details>

В ответе от сервера (переменная `fileProps`) под ключом `fileId` содержится идентификатор файла в хранилище, к которому необходимо будет обращаться на дальнейших этапах загрузки.

### Получение структуры файла в хранилище
```python
# получение структуры атрибутивной таблицы загруженного файла
fileId = fileProps['fileId']
getDataSchemaUrl = f'{host}/import/dataSchema?fileId={fileId}'

dataSchema = session.get(getDataSchemaUrl).json()
dataSchema
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}
{'layers': [{'name': 'road_density',
   'firstRow': {'cellid': 55,
    'cell_area': 1.948557158515364,
    'ln_km_sum': 0.085176276633635,
    'ln_per_km2': 0.043712485549324,
    'geometry': [[{'x': 55.771737144562465, 'y': 37.30378357901335},
      {'x': 55.77546064639296, 'y': 37.29166368450259},
      {'x': 55.78323865575917, 'y': 37.29132329419667},
      {'x': 55.787293259392904, 'y': 37.303107555298595},
      {'x': 55.78356865230713, 'y': 37.31523007709727},
      {'x': 55.775790547179675, 'y': 37.31556571039467},
      {'x': 55.771737144562465, 'y': 37.30378357901335}]]},
   'objectCount': 615,
   'layerDefinition': {'idAttribute': None,
    'titleAttribute': None,
    'geometryAttribute': 'geometry',
    'geometryType': 'polygon',
    'spatialReference': 4326,
    'isEditable': True,
    'attributes': {'cellid': {'type': 'Int32',
      'alias': None,
      'isNullable': True,
      'isEditable': True,
      'isDisplayed': True,
      'subType': 'None',
      'isUnique': False,
      'isCalculated': False,
      'stringFormat': None},
     'cell_area': {'type': 'Double',
      'alias': None,
      'isNullable': True,
      'isEditable': True,
      'isDisplayed': True,
      'subType': 'None',
      'isUnique': False,
      'isCalculated': False,
      'stringFormat': None},
     'ln_km_sum': {'type': 'Double',
      'alias': None,
      'isNullable': True,
      'isEditable': True,
      'isDisplayed': True,
      'subType': 'None',
      'isUnique': False,
      'isCalculated': False,
      'stringFormat': None},
     'ln_per_km2': {'type': 'Double',
      'alias': None,
      'isNullable': True,
      'isEditable': True,
      'isDisplayed': True,
      'subType': 'None',
      'isUnique': False,
      'isCalculated': False,
      'stringFormat': None},
     'geometry': {'type': 'Polygon',
      'alias': None,
      'isNullable': False,
      'isEditable': True,
      'isDisplayed': True,
      'subType': 'None',
      'isUnique': False,
      'isCalculated': False,
      'stringFormat': None}}},
   'children': None}],
 'type': 'gdal'}
{% endhighlight %}

</details>

Под ключом `layers` в описании структуры файла в хранилище `dataSchema` содержится список описаний структуры слоёв, содержащихся в файле. В общем случае список содержит 1 элемент, однако при загрузке файлов, форматы которых допускают хранение нескольких слоёв (например, KML, Excel-файл с несколькими листами или zip-архив с несколькими Shape-файлами), описание будет создано для каждого из слоёв и в дальнейшем будет необходимо выбрать, на основе какого из них создавать новые таблицу и слой для копирования данных.

### Создание таблицы
Используем полученное описание структуры файла `dataSchema` для создания JSON-описания параметров создаваемой таблицы

```python
tableName = f'{username}.rd_dens_tbl'
tableAlias = 'Плотность уличной сети'
tableDescription = 'Гексагональная сетка со значениями плотности дорожной сети г. Москвы'

layerDefinition = dataSchema['layers'][0]['layerDefinition']
geometryAttribute = layerDefinition['geometryAttribute']
srid = layerDefinition['spatialReference']
attributes = layerDefinition['attributes']

tableColumns = [
    {"name": "gid", "type": "Int64", "isNullable": False, "isUnique": True, "autoincrement": True},
    {"name": geometryAttribute, "type": attributes[geometryAttribute]['type'], "srid": srid}
]

columnsFromFile = [{'name': name, 'type': col['type']} for name, col in attributes.items() if name != geometryAttribute]
tableColumns = tableColumns + columnsFromFile

tableProps = {
    'name': tableName,
    'alias': tableAlias,
    'description': tableDescription,
    'columns': tableColumns
}

createTableUrl = f'{host}/tables'
headers = {'Content-type': 'application/json'}

r = session.post(url=createTableUrl, data=json.dumps(tableProps), headers=headers).json()
```

### Создание слоя
Создадим слой на основе ранее созданной таблицы
```python
tableName = f'{username}.rd_dens_tbl'
layerName = f'{username}.rd_dens_lyr'
layerAlias = 'Плотность уличной сети'
layerDescription = 'Слой, отображающий значения плотности уличной сети г. Москвы в гексагональных ячейках'

attributeList = [{"attributeName": col['name'], "columnName": col['name']} for col in tableColumns]

attributesConfiguration = {
    "idAttribute": "gid",
    "geometryAttribute": "geometry",
    "tableName": tableName,
    "attributes": attributeList
}

layerProps = {
    "name": layerName,
    "alias": layerAlias,
    "description": layerDescription,
    "attributesConfiguration": attributesConfiguration
}

createLayerUrl = f'{host}/layers'
params = {"type": "PostgresLayerService"}
headers = {'Content-type': 'application/json'}

r = session.post(url=createLayerUrl, params=params, data=json.dumps(layerProps), headers=headers).json()
```

### Копирование данных
Копирование данных из файла в слой или таблицу осуществляется с помощью вызова [планировщика](/api/scheduler) `scheduler` на сервере. Запрос на копирование создаёт задачу `task`, на выполнение которой требуется некоторое время, которое зависит от объёма копируемой информации.

Для создания задачи необходимо указать её тип `copy`, а в JSON-теле запроса - параметры исходного `source` и целевого `target` ресурсов, а также `attributeMapping` - сопоставление атрибутов этих ресурсов. В нашем случае названия всех атрибутов совпадают. Помимо этого, в JSON можно указать параметр `condition` - выражение для атрибутивной фильтрации копируемых объектов.

**Важно**: при загрузке данных из CSV и XLSX файлов необходимо указать атрибуты, из которых будет создана геометрия. [Подробнее](/api/scheduler/sources#параметры-для-statictaskdatastorage)
```python
source = {
    'type': 'staticTaskDataStorage', 
    'fileName': fileId, 
    'layerName': dataSchema['layers'][0]['name'] # имя слоя во временном хранилище
}

target = {
    'type': 'layerTaskDataStorage',
    'serviceName': layerName # системное имя целевого ресурса
}

attributeMapping = {attr: attr for attr in attributes.keys()}

copyProps = {
    'attributeMapping': attributeMapping,
    'source': source,
    'target': target
}

copyTaskUrl = f'{host}/scheduler/tasks'
params = {'type': 'copy'}
headers = {'Content-type': 'application/json'}
taskProps = session.post(url=copyTaskUrl, params=params, data=json.dumps(copyProps), headers=headers).json()
taskProps
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}

{'taskId': '022f299e-c86c-459a-ad2b-676ea2099958',
 'status': 'Scheduled',
 'taskResult': None}

{% endhighlight %}

</details>

В ответе от сервера содержится идентификатор задачи `taskId` и её текущий статус `status`, в начальный момент равный `Scheduled` (запланирована). 

### Проверка состояния задачи

Чтобы проверить статус задачи, необходимо выполнить **GET**-запрос, в URL которого указан её идентификатор.

```python
taskId = taskProps['taskId']
checkTaskUrl = f'{host}/scheduler/tasks/{taskId}/progress'

taskStatus = session.get(url checkTaskUrl).json()
taskStatus
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight python %}

{'id': '022f299e-c86c-459a-ad2b-676ea2099958',
 'status': 'Completed',
 'taskResult': {'message': None,
  'stepResults': [{'stepName': None,
    'inputSource': None,
    'outSource': None,
    'startedTime': '2023-11-29T07:10:47.0862084Z',
    'endedTime': '2023-11-29T07:10:47.0876722Z',
    'batchErrors': None,
    'batchCount': 1,
    'inputObjectCount': 615,
    'errorCount': 0,
    'outputObjectCount': 615,
    'resultDetails': None}],
  'inputObjectCount': 615,
  'errorCount': 0,
  'outputObjectCount': 615},
 'stepCount': 0,
 'currentStepId': 0,
 'currentStepAlreadyDone': 0,
 'currentStepObjectCount': 0,
 'resultDetails': None}

{% endhighlight %}

</details>

Когда статус задачи изменится на `Completed`, это значит, что копирование завершено и данные из файла успешно загружены.