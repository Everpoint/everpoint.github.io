---
layout: default
title: Изменение карты
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 6
---

# Изменение карты
Для внесения изменений в свойства карты (добавление и удаление слоёв, изменение их видимости и др.) необходимо выполнить **PATCH**-запрос с новыми параметрами карты:
```
PATCH {host}/projects/{name}
Content-Type: application/json
```
<details>
<summary>JSON body</summary>

{% highlight json %}
{
  "content": {
    "resolution": 0,
    "position": [
      0,
      0
    ],
    "srid": 0,
    "baseMapName": "string",
    "clientData": null,
    "items": [
      {
        "name": "string",
        "opacity": 1,
        "isVisible": true,
        "isExpanded": false,
        "isLegendExpanded": false,
        "minScale": 0,
        "maxScale": 0,
        "isBasemap": true,
        "children": [
          {}
        ]
      }
    ],
    "bookmarks": [
      {
        "title": "string",
        "position": [
          0,
          0
        ],
        "resolution": 0,
        "image": "string"
      }
    ]
  },
  "layersCount": 0,
  "name": "string",
  "alias": "string",
  "owner": "string",
  "description": "string",
  "preview": "string",
  "createdDate": "2019-08-24T14:15:22Z",
  "changedDate": "2019-08-24T14:15:22Z",
  "permissions": "none",
  "acl": {
    "data": [
      {
        "role": "string",
        "permissions": "none"
      }
    ]
  },
  "icon": "string",
  "invisibleInCatalog": true
}
{% endhighlight %}
</details>

Обязательными параметрами при создании карты являются её уникальное системное имя `name` и конфигурация `content`.
Все параметры изменения карты аналогичны параметрам её создания: новые значения перезаписывают старые. Для внесения точечных изменений целесообразно сначала получить текущее состояние карты с помощью **GET**-запроса, изменить необходимые значения в JSON, а затем выполнить **PATCH**-запрос с изменёнными параметрами.

## Пример 
Изменим [созданную ранее](/api/resources/create_layer/#пример) карту: удалим слой дорог, изменим описание и базовую карту.

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

projectName = f'{username}.infrastructure_map'
projectDescription = 'Карта городской инфраструктуры (здания и сооружения, коммуникации)'
baseMapName = 'openstreetmap_humanitarian'

# получение текущего состояния карты
projectInfoUrl = f'{host}/projects/{projectName}'
projectProps = session.get(url=projectInfoUrl).json()

# изменение конфигурации карты
projectUpdateProps = projectProps.copy()
projectUpdateProps['description'] = projectDescription
projectUpdateProps['content']['baseMapName'] = baseMapName

oldItems = projectProps['content']['items']
updatedItems = [i for i in oldItems if i['name'] != f'{username}.roads_layer']
projectUpdateProps['content']['items'] = updatedItems

# выполнение PATCH-запроса
r = session.patch(url=projectInfoUrl, data=json.dumps(projectUpdateProps), headers=headers).json()
```

### URL и JSON запроса
_Для работы с запросом в Postman или аналогичном приложении_

```
PATCH https://evergis.ru/sp/projects/username.infrastructure_map
Content-Type: application/json
```
JSON body:
```json
{
    "content": {
        "resolution": 19.10925707128908, 
        "position": [4341573.076967801, 5627640.917870802], 
        "srid": 3857, 
        "baseMapName": "openstreetmap_humanitarian", 
        "clientData": {"dateFilter": {"isVisible": false}}, 
        "items": [
            {
                "name": "username.buildings_layer", 
                "opacity": 1.0, 
                "isVisible": true, 
                "isExpanded": false, 
                "isLegendExpanded": false, 
                "minScale": 0.0, 
                "maxScale": 0.0, 
                "isBasemap": false, 
                "children": null
            },
            {
                "name": "username.communications_layer", 
                "opacity": 1.0, 
                "isVisible": true, 
                "isExpanded": false, 
                "isLegendExpanded": false, 
                "minScale": 0.0, 
                "maxScale": 0.0, 
                "isBasemap": false, 
                "children": null
            }
        ], 
        "bookmarks": null
    }, 
    "layersCount": 1, 
    "name": "username.infrastructure_map", 
    "alias": "Инфраструктура", 
    "owner": "username", 
    "description": "Карта городской инфраструктуры (здания и сооружения, коммуникации)", 
    "preview": null, 
    "createdDate": "2023-11-23T19:02:00.776637Z", 
    "changedDate": "2023-11-23T19:03:42.055655Z", 
    "permissions": "read,write,configure", 
    "acl": {"data": [{"role": "__username", "permissions": "read,write,configure"}]}, 
    "icon": null, "invisibleInCatalog": false
}
```