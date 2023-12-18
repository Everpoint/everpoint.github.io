---
layout: default
title: Получение списка таблиц
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: -3
---

# Получение списка таблиц
Для того, чтобы получить список доступных пользователю таблиц (источников данных), необходимо выполнить **GET**-запрос с указанием параметров в строке URL:
```
GET {host}/tables
```

URL-параметры запроса:

- `filter` - текстовый фильтр для поиска таблиц. Осуществляет поиск по системным именам и псевдонимам (alias);
    - Если перед текстом указать символ `^`, будут возвращены таблицы, названия или псевдонимы которых начинаются с введённой строки;
    - Если перед текстом указать символ `@`, будут возвращены таблицы, названия или псевдонимы которых содержат введённую строку;
- `offset` - количество первых записей, которые нужно скрыть из выдачи;
- `limit` - максимальное количество описаний таблиц, которое будет возвращено. По умолчанию - 20;
- `group` - фильтровать таблицы по типу доступа:
    - `my` - таблицы, принадлежащие текущему пользователю;
    - `role` - таблицы других пользователей, доступные текущему пользователю.
    - `public` - таблицы в публичном доступе;
    - `all` - все типы;
- `names` - список системных имён таблиц, информацию о которых необходимо получить. Список указывается через разделитель `,`;
- `orderByField` - значения, по которым необходимо отсортировать поисковую выдачу. Если перед названием переменной указать `-`, сортировка будет произведена в порядке убывания. Несколько переменных могут быть указаны с разделителем `,`. Переменные для сортировки:
    - `alias` - сортировать по псевдониму;
    - `changedDate` - по дате и времени последнего изменения;
- `geometryFilter` - фильтр таблиц по типу геометрии. Несколько типов можно указать с разделителем `,`.

Если оставить все параметры запроса пустыми, то будет возвращён полный список доступных таблиц с учётом значений параметров по умолчанию. То есть, будут возвращены описания первых 20 таблиц, принадлежащих пользователю.

## Пример
Получим список таблиц с полигональной геометрией, принадлежащих текущему пользователю:
```
GET https://evergis.ru/sp/tables?geometryFilter=Polygon&group=my
```
<details>
<summary>Просмотреть ответ сервера</summary>

{% highlight json %}

{
    "items": [
        {
            "rowCount": 10,
            "geometries": [
                "polygon"
            ],
            "type": "TileCatalogTable",
            "configuration": null,
            "name": "username.landsatimagery",
            "alias": "Снимки Landsat",
            "owner": "username",
            "description": "Снимки ландшафтов России, полученные спутником Landsat",
            "preview": null,
            "createdDate": "2022-11-10T13:57:29.161683Z",
            "changedDate": "2022-11-10T13:57:29.161683Z",
            "permissions": "read,write,configure",
            "acl": {
                "data": [
                    {
                        "role": "__username",
                        "permissions": "read,write,configure"
                    },
                    {
                        "role": "__public",
                        "permissions": "read"
                    }
                ]
            },
            "icon": null,
            "invisibleInCatalog": false
        },
        {
            "rowCount": 9,
            "geometries": [
                "polygon"
            ],
            "type": "TileCatalogTable",
            "configuration": null,
            "name": "username.ls89barnaul",
            "alias": "Landsat Барнаул",
            "owner": "username",
            "description": "Разносезонные снимки окрестностей Барнаула, полученные спутниками Landsat 8 и 9 в натуральных цветах. Пространственное разрешение 30 м.",
            "preview": null,
            "createdDate": "2022-11-22T21:47:24.948713Z",
            "changedDate": "2022-11-22T21:47:24.948713Z",
            "permissions": "read,write,configure",
            "acl": {
                "data": [
                    {
                        "role": "__username",
                        "permissions": "read,write,configure"
                    }
                ]
            },
            "icon": null,
            "invisibleInCatalog": false
        },
        {
            "rowCount": 7,
            "geometries": [
                "polygon"
            ],
            "type": "TileCatalogTable",
            "configuration": null,
            "name": "username.lsvolgadelta",
            "alias": "Landsat Дельта Волги",
            "owner": "username",
            "description": "Разновременной набор снимков, отображающий динамику ландшафтов в дельте Волги за 25 лет",
            "preview": null,
            "createdDate": "2022-11-23T19:28:27.872978Z",
            "changedDate": "2022-11-23T21:39:35.06761Z",
            "permissions": "read,write,configure",
            "acl": {
                "data": [
                    {
                        "role": "__username",
                        "permissions": "read,write,configure"
                    }
                ]
            },
            "icon": null,
            "invisibleInCatalog": false
        },
        {
            "rowCount": 4,
            "geometries": [
                "polygon"
            ],
            "type": "Table",
            "configuration": null,
            "name": "username.buildings_table3",
            "alias": "Здания",
            "owner": "username",
            "description": "Здания с информацией об адресе, назначении, количестве этажей, годе постройки и материале",
            "preview": null,
            "createdDate": "2023-11-29T11:21:11.9558Z",
            "changedDate": "2023-11-29T11:21:11.9558Z",
            "permissions": "read,write,configure",
            "acl": {
                "data": [
                    {
                        "role": "__username",
                        "permissions": "read,write,configure"
                    }
                ]
            },
            "icon": null,
            "invisibleInCatalog": false
        },
        {
            "rowCount": 615,
            "geometries": [
                "polygon"
            ],
            "type": "Table",
            "configuration": null,
            "name": "username.rd_dens_tbl",
            "alias": "Плотность уличной сети",
            "owner": "username",
            "description": "Гексагональная сетка со значениями плотности дорожной сети г. Москвы",
            "preview": null,
            "createdDate": "2023-12-08T12:08:19.90308Z",
            "changedDate": "2023-12-08T12:08:19.90308Z",
            "permissions": "read,write,configure",
            "acl": {
                "data": [
                    {
                        "role": "__username",
                        "permissions": "read,write,configure"
                    }
                ]
            },
            "icon": null,
            "invisibleInCatalog": false
        }
    ],
    "totalCount": 5,
    "offset": 0,
    "limit": 20
}

{% endhighlight %}

</details>
