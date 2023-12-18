---
layout: default
title: Получение списка слоёв
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: -2
---

# Получение списка слоёв
Процесс получения списка слоёв аналогичен получению списка таблиц. Для того, чтобы получить список доступных пользователю слоёв, необходимо выполнить **GET**-запрос с указанием параметров в строке URL:
```
GET {host}/layers
```

URL-параметры запроса:

- `filter` - текстовый фильтр для поиска слоёв. Осуществляет поиск по системным именам и псевдонимам (alias);
    - Если перед текстом указать символ `^`, будут возвращены слои, названия или псевдонимы которых начинаются с введённой строки;
    - Если перед текстом указать символ `@`, будут возвращены слои, названия или псевдонимы которых содержат введённую строку;
- `types` - типы слоёв, по которым осуществляется поиск. [Подробнее о типах слоёв](/api/resources/index#сервисы--слои)
- `offset` - количество первых записей, которые нужно скрыть из выдачи;
- `limit` - максимальное количество описаний слоёв, которое будет возвращено. По умолчанию - 20;
- `group` - фильтровать слои по типу доступа:
    - `my` - слои, принадлежащие текущему пользователю (по умолчанию);
    - `role` - слои других пользователей, доступные текущему пользователю.
    - `public` - слои в публичном доступе;
    - `all` - все типы;
- `names` - список системных имён слоёв, информацию о которых необходимо получить. Список указывается через разделитель `,`;
- `orderByField` - значения, по которым необходимо отсортировать поисковую выдачу. Если перед названием переменной указать `-`, сортировка будет произведена в порядке убывания. Несколько переменных могут быть указаны с разделителем `,`. Переменные для сортировки:
    - `alias` - сортировать по псевдониму;
    - `changedDate` - по дате и времени последнего изменения;
- `geometryFilter` - фильтр слоёв по типу геометрии. Несколько типов можно указать с разделителем `,`.

Если оставить все параметры запроса пустыми, то будет возвращён полный список доступных слоёв с учётом значений параметров по умолчанию. То есть, будут возвращены описания первых 20 слоёв, принадлежащих пользователю.

## Пример
Получим список слоёв с полигональной геометрией, принадлежащих текущему пользователю:
```
GET https://evergis.ru/sp/layers?geometryFilter=Polygon&group=my
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight json %}

{
    "items": [
        {
            "name": "username.wyxmahhuyidn",
            "type": "PostgresLayerService",
            "alias": "Плотность уличной сети",
            "description": "Плотность улично-дорожной сети Москвы\nРассчитана по ячейкам гексагональной сетки\nИсточник: OpenStreetMap",
            "owner": "username",
            "ownerName": null,
            "createdDate": "2022-11-23T22:51:38.315096Z",
            "changedDate": "2023-11-21T05:00:26.319671Z",
            "permissions": "read,write,configure",
            "preview": "0dc924d94f8247c2ad8998d76415a8f1.png",
            "minResolution": 0.0,
            "maxResolution": 0.0,
            "condition": null,
            "geometryType": "polygon",
            "objectCount": 4263,
            "dataSourceType": "Table",
            "tags": null,
            "envelope": {
                "coordinates": [
                    [
                        37.29457135683897,
                        55.4924388177337
                    ],
                    [
                        37.95961971215546,
                        55.960621585577144
                    ]
                ],
                "type": "envelope",
                "sr": 84
            },
            "invisibleInCatalog": false
        },
        {
            "name": "username.buildings_layer",
            "type": "PostgresLayerService",
            "alias": "Здания",
            "description": "Слой зданий с информацией об адресе, назначении, количестве этажей, годе постройки и материале",
            "owner": "username",
            "ownerName": null,
            "createdDate": "2023-11-29T11:49:30.450024Z",
            "changedDate": "2023-12-14T20:36:24.491235Z",
            "permissions": "read,write,configure",
            "preview": null,
            "minResolution": 0.0,
            "maxResolution": 0.0,
            "condition": null,
            "geometryType": "polygon",
            "objectCount": 4,
            "dataSourceType": "Table",
            "tags": null,
            "envelope": {
                "coordinates": [
                    [
                        4188887.18861019,
                        7503816.8701021895
                    ],
                    [
                        4191634.144314188,
                        7507261.3136892915
                    ]
                ],
                "type": "envelope",
                "sr": 3857
            },
            "invisibleInCatalog": false
        },
        {
            "name": "username.rd_dens_lyr",
            "type": "PostgresLayerService",
            "alias": "Плотность уличной сети",
            "description": "Слой, отображающий значения плотности уличной сети г. Москвы в гексагональных ячейках",
            "owner": "username",
            "ownerName": null,
            "createdDate": "2023-12-08T12:08:23.423444Z",
            "changedDate": "2023-12-12T18:14:39.633945Z",
            "permissions": "read,write,configure",
            "preview": null,
            "minResolution": 0.0,
            "maxResolution": 0.0,
            "condition": null,
            "geometryType": "polygon",
            "objectCount": 615,
            "dataSourceType": "Table",
            "tags": null,
            "envelope": {
                "coordinates": [
                    [
                        37.29030112036578,
                        55.483500094669985
                    ],
                    [
                        37.975184068856876,
                        55.965807464273844
                    ]
                ],
                "type": "envelope",
                "sr": 84
            },
            "invisibleInCatalog": false
        }
    ],
    "totalCount": 3,
    "offset": 0,
    "limit": 20
}

{% endhighlight %}

</details>
