---
layout: default
title: Инструменты геообработки
parent: Планировщик
grand_parent: EverGIS API
nav_order: 20
---

# Инструменты геообработки
Отдельная группа запросов для планировщика отвечает за создание задач на выполнение инструментов геообработки.
Для создания такой задачи необходимо выполнить **POST**-запрос:
```
POST {host}/scheduler/tasks#type={taskType}
Content-Type: application/json
```

JSON-тело запроса зависит от вида вызываемого инструмента:
- Построение буферных зон `type=buffer`;
- Построение зоны доступности `type=route`;
- Выборка геометрией `type=filterCopy`;
- Объединение геометрий `type=union`;
- Геометрический оверлей `type=overlay`;
- Агрегация `type=aggregate`.

## Построение буферных зон `type=buffer`
Инструмент позволяет строить буферные зоны вокруг точек, линий и полигонов


JSON-параметры:
- `type` - `buffer`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, от которого будут построены буферные зоны. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого слоя, в который будут загружены результирующие буферные зоны. **Обязательный параметр**;
- `radii` - список/массив радиусов. В качестве радиуса может быть подано расстояние в метрах либо выражение на основе атрибутов слоя. **Обязательный параметр**;
- `excludeInnerBuffers` - вырезать меньшие буферы из больших (`true` или `false`). По умолчанию - `false`. Позволяет создавать из буферов кольца. Указывается только если задано несколько радиусов для буферов.
- `excludeSourcePolygon` - вырезать из получившегося буфера исходный полигон (`true` или `false`). По умолчанию - `false`. Используется только в случаях, когда буфер строится по полигональному слою;
- `baseObjectIdAttributeName` - название атрибута, в котором будет записана ссылка на исходный объект в результирующем слое. По умолчанию - `base_object`;
- `radiusAttributeName` - название атрибута, в котором будет записан радиус буфера в результирующем слое. По умолчанию - `buffer_radius`;
- `idAttributeName` - название атрибута-идентификатора для результирующего слоя. По умолчанию - `gid`;
- `geometryAttributeName` - название атрибута геометрии для результирующего слоя. По умолчанию - `geometry`;

### Пример
Создадим буферные зоны точек, содержащихся в слое `username.source_points`, с радиусом, указанным в атрибуте `radius`:

```
POST {host}/scheduler/tasks#type=buffer
Content-Type: application/json
```

```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.source_points"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.buffer_zones",
        "createNewService": true
    },
    "radii": [
        "radius"
    ]
}
```

## Построение зон доступности `type=route`
Инструмент позволяет строить зоны доступности (изохроны) входных точек с использованием дорожного графа.

JSON-параметры:
- `type` - `route`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, от объектов которого будут построены зоны доступности. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого ресурса, в который будут загружены результирующие зоны доступности. **Обязательный параметр**;
- `duration` - радиус зоны доступности (изохрона) в секундах. Может быть задана числом либо выражением на основе атрибутов исходного слоя. **Обязательный параметр**;
- `providerType` - тип зоны доступности. "sp_walk" - пешеходная, "sp_car" - автомобильная. **Обязательный параметр**;
- `durationAttributeName` - атрибут результирующего слоя, в который будет записано значение радиуса зоны доступности;
- `routeCenterXAttributeName` - атрибут результирующего слоя, в который будет записано значение координаты X исходной точки;
- `routeCenterYAttributeName` - атрибут результирующего слоя, в который будет записано значение координаты Y исходной точки;
- `baseObjectIdAttributeName` - название атрибута, в котором будет записана ссылка на исходный объект в результирующем слое. По умолчанию - `base_object`;
- `idAttributeName` - название атрибута-идентификатора для результирующего слоя. По умолчанию - `gid`;
- `geometryAttributeName` - название атрибута геометрии для результирующего слоя. По умолчанию - `geometry`;

### Пример
Создадим зоны доступности точек, содержащихся в слое `username.source_points`, с радиусом в минутах, указанным в атрибуте `duration`:

```
POST {host}/scheduler/tasks#type=route
Content-Type: application/json
```

```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.source_points"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.access_zones",
        "createNewService": true
    },
    "duration": "duration * 60",
    "providerType": "sp_walk"
}
```

*Внимание: радиус зоны доступности в таблице указан в минутах, а инструмент требует указывать его в секундах. Поэтому в выражении значение* `duration` *было умножено на 60*.

## Выборка геометрией `type=filterCopy`
Инструмент позволяет выбирать объекты исходного слоя, которые пересекаются с объектами выбирающего слоя.

JSON-параметры:
- `type` - `filterCopy`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, объекты которого будут выбраны. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого слоя, в который будут загружены выбранные объекты. **Обязательный параметр**;
- `geometryFilterStorage` - описание слоя, содержащего объекты, по которым будет осуществлена выборка;
- `reverseGeometryFilter` - обратить геометрический фильтр (`true` или `false`). Если `true`, то будут выбраны объекты, которые **не** пересекаются с объектами слоя для выборки;
- `attributeMapping` - сопоставление атрибутов исходного и целевого слоя;
- `condition` - [выражение](/help/attr_query) для атрибутивной фильтрации копируемых объектов;

### Сопоставление атрибутов
`attributeMapping` используется в случае, если в исходном и целевом слое названия одного или нескольких атрибутов не совпадают. 
`attributeMapping` задаётся в виде JSON-объекта, где ключами являются названия атрибутов исходного слоя, а значениями - названия соответствующих им атрибутов целевого слоя:

```json
{
    "sourceAttr1": "targetAttr1",
    "sourceAttr2": "targetAttr2",
    "sourceAttr3": "targetAttr3",
}
```
### Пример
Осуществим выборку исходных точек, содержащихся в слое `username.source_points`. Выберем те точки, которые находятся за пределами полигонов, содержащихся в слое `username.filter_polygons`

```
POST {host}/scheduler/tasks#type=filterCopy
Content-Type: application/json
```
```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.source_points"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.selected_points",
        "createNewService": true
    },
    "geometryFilterStorage": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.filter_polygons",
    },
    "reverseGeometryFilter": true
}
```

## Объединение геометрий `type=union`
Инструмент позволяет объединить пересекающиеся геометрии одного слоя

JSON-параметры:
- `type` - `union`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, объекты которого будут объединены. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого слоя, в который будут загружены результирующие объединённые объекты. **Обязательный параметр**;

### Пример
Объединим пересекающиеся полигоны в слое `username.source_polygons`.

```
POST {host}/scheduler/tasks#type=union
Content-Type: application/json
```
```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.source_polygons"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.polygon_union",
        "createNewService": true
    }
}
```

## Геометрический оверлей `type=overlay`
Инструмент позволяет совершать операции геометрического оверлея (объединение, пересечение, вычитание, симметрическая разность) над объектами двух слоёв.

JSON-параметры:
- `type` - `overlay`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, объекты которого будут объединены. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого слоя, в который будут загружены результирующие объединённые объекты. **Обязательный параметр**;
- `operation` - тип операции оверлея (**обязательный параметр**):
    - `union` - объединение;
    - `intersection` - пересечение;
    - `subtraction` - вычитание;
    - `symDifference` - симметрическая разность;
- `toolLayer` - описание слоя (только `layerTaskDataStorage`), который будет использоваться для оверлея. Для операции вычитания `subtraction` геометрия `toolLayer` будет вычтена из геометрии `source`;

### Пример
Вычтем из объектов слоя `username.source_polygons` объекты слоя `username.subtract_polygons`:
```
POST {host}/scheduler/tasks#type=overlay
Content-Type: application/json
```
```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.source_polygons"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.subtract_polygons",
        "createNewService": true
    },
    "toolLayer": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.overlay_polygons"
    },
    "operation": "subtraction"
}
```

## Агрегация данных `type=aggregate`
Инструмент агрегации позволяет рассчитывать различные метрики на основе значений указанного атрибута объектов исходного слоя, попадающих в каждый полигон агрегирующего слоя.

JSON-параметры:
- `type` - `aggregate`. **Обязательный параметр** если задача входит в [пайплайн](/api/scheduler/pipeline).
- `source` - описание исходного слоя, объекты и атрибуты которого будут агрегированы. **Обязательный параметр**. [Подробнее об описаниях ресурсов](/api/scheduler/sources);
- `target` - описание целевого слоя, в который будут загружены результирующие объединённые объекты. **Обязательный параметр**;
- `geometry` - описание слоя, содержащего агрегирующие полигоны. **Обязательный параметр**;
- `aggregationSettings` - список/массив JSON-объектов, содержащих параметры настроек агрегации. Каждый элемент списка отвечает за расчёт одного агрегированного атрибута:
    - `sourceAttributeName` - название атрибута исходного слоя, который будет агрегирован. **Обязательный параметр**;
    - `targetAttributeName` - название атрибута целевого слоя, в который будут записаны агрегированные значения. **Обязательный параметр**;
    - `aggregationFunction` - функция агрегации значений атрибута исходного слоя:
        - `Array` - возвращает массив, собранный из значений атрибутов объектов исходного слоя, попавших в каждый из полигонов;
        - `Min` - минимальное значение;
        - `Max` - максимальное значение;
        - `Avg` - среднее значение;
        - `Sum` - сумма;
        - `Extent` - WKB ограничивающего прямоугольника выборки объектов;
        - `Count` - количество непустых записей в указанном поле;
        - `TotalCount` - количество объектов (в том числе с пустыми атрибутами);
        - `DistinctCount` - количество уникальных значений атрибута;
        - `First` - первая запись в выборке объектов;
        - `Last` - последняя запись в выборке объектов;
        - `Median` - медиана выборки;
        - `Mod` - мода выборки;
        - `StdDeviation` - стандартное отклонение выборки;
        - `SumOfProduct` - сумма произведений основного и вспомогательного атрибута;
        - `WeightedAvg` - взвешенное среднее (вспомогательный атрибут используется как веса);
        - `DensityIndicators` - сумма значений атрибута на единицу площади полигона;
        - `DividedSum` - частное суммы основного и суммы вспомогательного атрибута;
    - `additionalSourceAttribute` - название вспомогательного атрибута исходного слоя, используемого в некоторых видах функции агрегации. **Обязательный параметр** для функций `SumOfProduct`, `WeightedAvg`, `DividedSum`.

### Пример
Рассчитаем сумму значений атрибута `value`, а также его средневзвешенное значение по весам `weights` на основе данных слоя `username.data_points` в пределах полигонов слоя `username.aggregation_polygons`.
```
POST {host}/scheduler/tasks#type=aggregate
Content-Type: application/json
```
```json
{
    "source": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.data_points"
    },
    "target": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.aggregation_result",
        "createNewService": true
    },
    "geometry": {
        "type": "layerTaskDataStorage",
        "serviceName": "username.aggretaion_polygons"
    },
    "aggregationSettings": [
        {
            "sourceAttributeName": "value",
            "targetAttributeName": "value_SUM",
            "aggregationFunction": "Sum"
        },
        {
            "sourceAttributeName": "value",
            "targetAttributeName": "value_WAVG",
            "additionalSourceAttribute": "weights",
            "aggregationFunction": "WeightedAvg"
        }
    ]
}
```