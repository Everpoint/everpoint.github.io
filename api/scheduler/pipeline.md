---
layout: default
title: Пайплайны
parent: Планировщик
grand_parent: EverGIS API
nav_order: 30
---

# Пайплайны
Пайплайны позволяют группировать несколько задач в одну и выполнять их последовательно, при этом отслеживая общий прогресс выполнения.

Чтобы создать пайплайн, необходимо выполнить **POST**-запрос:
```
POST {host}/scheduler/tasks#type=pipeline
Content-Type: application/json
```

JSON-тело запроса состоит из одного параметра:

- `innerTasks` - список/массив из JSON-наборов параметров описаний задач, входящих в пайплайн (**обязательный параметр**). Задачи будут выполняться одна за другой последовательно в том порядке, в котором они указаны в списке.

## Временные слои
Для сохранения промежуточных результатов обработки внутри пайплайна целесообразно использовать временные слои, которые создаются в пространстве имён `temp` (`temp.layer_name`) и автоматически удаляются после завершения пользовательской сессии. Описания временных слоёв в качестве `source` и `target` строятся так же, как и для обычных слоёв (`layerTaskDataStorage`). 

## Пример
Выберем точки из слоя `username.data_points`, находящиеся на расстоянии не более 300 метров от точек слоя `username.source_points`.

Для этого необходимо:
1. Построить буферные зоны точек `username.source_points` с радиусом 300 метров с помощью [инструмента построения буфера](/api/scheduler/spatial_tools#построение-буферных-зон-typebuffer)
2. Выбрать точки, попадающие в пределы буферных зон с помощью [инструмента выборки геометрией](/api/scheduler/spatial_tools#выборка-геометрией-typefiltercopy).

Для удобства объединим эти задачи в один пайплайн, а промежуточные буферные зоны, которые не будут нужны в дальнейшем, сохраним во временный слой `temp.temp_buffers`. Результат запишем в слой `username.selected_points`
```
POST {host}/scheduler/tasks#type=pipeline
Content-Type: application/json
```
```json
{
    "innerTasks": [
        {
            "type": "buffer",
            "source": {
                "serviceName": "username.source_points",
                "type": "layerTaskDataStorage"
            },
            "target": {
                "serviceName": "temp.temp_buffers",
                "type": "layerTaskDataStorage",
                "createNewService": true,
            },
            "radii": ["300"]
        },
        {
            "type": "filterCopy",
            "source": {
                "type": "layerTaskDataStorage",
                "serviceName": "username.data_points"
            },
            "target": {
                "type": "layerTaskDataStorage",
                "serviceName": "username.selected_points",
                "createNewService": true
            },
            "geometryFilterStorage": {
                "type": "layerTaskDataStorage",
                "serviceName": "temp.temp_buffers",
            }
        }
    ]
}
```