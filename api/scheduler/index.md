---
layout: default
title: Планировщик
parent: EverGIS API
has_toc: false
has_children: true
nav_order: 10
---

# Планировщик

Для задач, выполнение которых может занимать большое количество времени, EverGIS Online использует планировщик (scheduler). К таким задачам относятся копирование объектов, вызов инструментов геообработки или экспорт карты в изображение. Планировщик позволяет избежать долгого ожидания ответа на запросы этих видов, а также отслеживать прогресс выполнения задач в реальном времени.

Взаимодействие пользователя с задачами для планировщика строится на следующих принципах:
- Пользователь создаёт задачу (task) путём **POST**-запроса к планировщику с параметрами задачи. В ответ на запрос пользователь получает ответ, который содержит статус задачи (на момент создания задача имеет статус `Scheduled` - запланирована) и идентификатор задачи `taskId`, по которому можно отслеживать текущий прогресс.
- Пользователь может проверить статус и прогресс выполнения задачи с помощью **GET**-запроса, содержащего идентификатор `taskId`. Помимо самого статуса, ответ на этот запрос будет содержать дополнительные данные о её выполнении (например, время создания, время начала выполнения, численные данные о текущем прогрессе, время конца выполнения). Возможные статусы:
    - `Scheduled` - задача создана (выполнение ещё не начато);
    - `Planning` - задача планируется (в очереди);
    - `Executing` - выполняется;
    - `Completed` - выполнена успешно;
    - `Failed` - при выполнении произошла ошибка;
    - `Canceled` - выполнение задачи отменено;
    - `Timeout` - выполнение задачи отменено из-за превышения лимита времени.
- Пользователь может вручную отменить выполнение задачи с помощью **POST**-запроса.

## Запросы для работы с планировщиком

### Создание задачи
Для создания задачи необходимо выполнить **POST**-запрос:
```
POST {host}/scheduler/tasks#type={taskType}
Content-Type: application/json
```
JSON-тело запроса зависит от вида создаваемой задачи. Возможные виды задач:
- [Копирование](/api/scheduler/copy_task) `type=copy`;
- [Расчёт значений атрибутов на основе EQL-выражений](/api/scheduler/edit_attributes) `type=editAttributes`;
- [Инструменты геообработки](/api/scheduler/spatial_tools):
    - Агрегация `type=aggregate`;
    - Построение буферных зон `type=buffer`;
    - Построение зоны доступности `type=route`;
    - Выборка геометрией `type=filterCopy`;
    - Геометрический оверлей `type=overlay`.
- Загрузка файлов в растровый каталог `type=tiling`;
- [Пайплайн (последовательность нескольких задач)](/api/scheduler/pipeline) `type=pipeline`;

В ответ на этот запрос вне зависимости от типа задачи придёт ответ, содержащий `taskId`:
```json
{
    "taskId": "1c8d7949-e460-4bec-8f70-958df5e88079", 
    "type": null, 
    "owner": null,
    "status": "Scheduled", 
    "taskResult": null
}
```
### Получение информации о задаче
Чтобы получить информацию о задаче, необходимо выполнить **GET**-запрос с указанием `taskId`:
```
GET {host}/scheduler/{taskId}
```

Ответ сервера будет содержать статус и конфигурацию задачи:
```json
{
    "id": "1c8d7949-e460-4bec-8f70-958df5e88079", 
    "owner": "username", 
    "status": "Completed", 
    "parameters": {
        "type": "copy", 
        "condition": null, 
        "attributeMapping": null, 
        "source": {
            "serviceName": "username.test_lyr1", 
            "condition": null, 
            "createNewService": false, 
            "type": "layerTaskDataStorage"
        }, 
        "target": {
            "serviceName": "username.test_lyr2", 
            "condition": null, 
            "createNewService": false, 
            "type": "layerTaskDataStorage"
        }
    }, 
    "createdDate": "2023-12-08T12:15:15.184826Z", 
    "startedDate": "2023-12-08T12:15:15.506162Z", 
    "completedDate": "2023-12-08T12:15:16.853672Z"
}
```

### Проверка статуса и прогресса задачи
Для проверки статуса и прогресса задачи необходимо выполнить **GET**-запрос с указанием `taskId`:
```
GET {host}/scheduler/{taskId}/progress
```

Ответ сервера будет содержать статус задачи и данные о её прогрессе:
```json
{
    "id": "1c8d7949-e460-4bec-8f70-958df5e88079", 
    "status": "Completed",
     "taskResult": {
        "message": null, 
        "stepResults": [
            {
                "stepName": null, 
                "inputSource": null, 
                "outSource": null, 
                "startedTime": "2023-12-08T12:15:16.7017739Z", 
                "endedTime": "2023-12-08T12:15:16.7146577Z", 
                "batchErrors": null, 
                "batchCount": 1, 
                "inputObjectCount": 615, 
                "errorCount": 0, 
                "outputObjectCount": 615, 
                "resultDetails": null
            }
        ], 
        "inputObjectCount": 615, 
        "errorCount": 0, 
        "outputObjectCount": 615
     }, 
     "stepCount": 0, 
     "currentStepId": 0, 
     "currentStepAlreadyDone": 0, 
     "currentStepObjectCount": 0, 
     "resultDetails": null
}
```

### Отмена задачи
Чтобы отменить выполнение задачи, необходимо выполнить **POST**-запрос с указанием `taskId`:
```
POST {host}/scheduler/tasks/{taskId}/cancel
```

Ответ сервера будет содержать статус задачи `Canceled` и информацию о прогрессе на момент отмены:
```json
{
    "id": "e811e81f-5f46-4e47-9252-d800637a349e", 
    "status": "Canceled", 
    "taskResult": {
        "message": "Cancelled by external request.", 
        "stepResults": null, 
        "inputObjectCount": 0, 
        "errorCount": 0, 
        "outputObjectCount": 0
    }, 
    "stepCount": 0, 
    "currentStepId": 0, 
    "currentStepAlreadyDone": 0, 
    "currentStepObjectCount": 0, 
    "resultDetails": null
}
```