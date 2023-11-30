---
layout: default
title: Создание карты
parent: Таблицы, слои, карты
grand_parent: EverGIS API
nav_order: 3
---

# Создание карт
Чтобы создать карту (проект), необходимо выполнить **POST**-запрос:
```
POST {host}/projects
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

## Системное имя карты
Системное имя карты строится аналогичным с именами таблиц и слоёв образом и указывается в формате `"namespace.name"`, где `namespace` - пространство имён, в котором создаётся карта. Как правило, оно совпадает с логином пользователя. В название слоя могут входить латинские буквы, цифры, а также символы `_$-.`

## Конфигурация карты
Конфигурация карты (проекта) задаётся json-объектом, описывающим параметры:

- `resolution` - показатель масштаба карты, может варьироваться от 0 (самый детальный) до 20000 (самый мелкий);
- `position` - координаты центральной точки карты [X, Y];
- `srid` - система координат карты (EPSG-код, например, 4326 - WGS84 или 3857 - Web Mercator WGS84);
- `baseMapName` - базовая карта проекта ("подложка");
- `items` - список/массив json-объектов, описывающих входящие в карту слои;
- `bookmarks` - список/массив json-объектов, описывающих закладки для карты.

### Описание слоёв карты
Описание `items` входящих в карту слоёв внутри `content` состоит из параметров:

- `name` - системное имя слоя (обязательный параметр);
- `opacity` - непрозрачность слоя (может принимать значения от 0 до 1);
- `isVisible` - видимость слоя (`true` или `false`);
- `isExpanded` - развернуть список дочерних элементов в интерфейсе (`true` или `false`);
- `isLegendExpanded` - развернуть легенду слоя в интерфейсе (`true` или `false`);
- `minScale` - минимальный масштабный уровень, при котором слой виден;
- `maxScale` - максимальный масштабный уровень, при котором слой виден;
- `isBasemap` - слой является базовой картой (`true` или `false`);
- `children` - дочерние элементы, описываются по такому же формату что и `items`;

## Другие параметры создания карты
Помимо обязательных параметров при создании слоя можно указать:
- `alias` - отображаемое в интерфейсе имя;
- `description` - текстовое описание карты;
- `acl` - Access Control List (описание настроек доступа к карте).

[Полный перечень и описание параметров создания карты](https://evergis.ru/sp/docs/index.html#tag/Projects/operation/ProjectsController_CreateProject){:target="_blank"}

## Пример
Создадим карту инфраструктуры города на основе слоёв зданий, дорог и коммуникаций. Слой зданий был создан ранее в [примере](/api/resources/create_layer/#пример). Остальные слои могут быть созданы по аналогии.

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

# описание параметров создания карты
projectName = f'{username}.infrastructure_map'
projectAlias = 'Инфраструктура'
projectDescription = 'Карта городской инфраструктуры (здания и сооружения, дороги, коммуникации)'

projectContent = {
    'srid': 3857,
    'position': [4338599.937933926, 5627602.295701091],
    'resolution': 20,
    'baseMapName': '2gis',
    'items': [
        {'name': f'{username}.buildings_layer'},
        {'name': f'{username}.roads_layer'},
        {'name': f'{username}.communications_layer'}
    ]
}

projectProps = {
    "name": projectName,
    "alias": projectAlias,
    "description": projectDescription,
    "content": projectContent
}

createProjectUrl = f'{host}/projects'

# выполнение запроса
r = session.post(url=createProjectUrl, data=json.dumps(projectProps), headers=headers).json()
```

### URL и JSON запроса
*Для работы с запросом в Postman или аналогичном приложении*

```
POST https://evergis.ru/sp/projects
Content-Type: application/json
```
JSON body:
```json
{
    "name": "username.infrastructure_map", 
    "alias": "Инфраструктура", 
    "description": "Карта городской инфраструктуры (здания, сооружения, дороги, коммуникации)", 
    "content": {
        "srid": 3857, 
        "position": [4338599.937933926, 5627602.295701091], 
        "resolution": 20, 
        "baseMapName": "2gis", 
        "items": [
            {"name": "username.buildings_layer"},
            {"name": "username.roads_layer"},
            {"name": "username.communications_layer"}
        ]
    }
}
```

## Получение свойств карты
Чтобы получить свойства карты, достаточно выполнить **GET**-запрос с её системным именем:
```
GET {host}/projects/{name}
```

На примере только что созданной карты:
```
projectInfoUrl = f'{host}/projects/{projectName}'
projectInfo = session.get(url=projectInfoUrl)
projectInfo
```
<details>
<summary>Просмотреть ответ сервера</summary>
{% highlight python %}
{'content': {'resolution': 20.0,
  'position': [4338599.937933926, 5627602.295701091],
  'srid': 3857,
  'baseMapName': '2gis',
  'clientData': None,
  'items': [{'name': 'username.buildings_layer',
    'opacity': 1.0,
    'isVisible': True,
    'isExpanded': False,
    'isLegendExpanded': False,
    'minScale': 0.0,
    'maxScale': 0.0,
    'isBasemap': False,
    'children': None},
   {'name': 'username.roads_layer',
    'opacity': 1.0,
    'isVisible': True,
    'isExpanded': False,
    'isLegendExpanded': False,
    'minScale': 0.0,
    'maxScale': 0.0,
    'isBasemap': False,
    'children': None},
   {'name': 'username.communications_layer',
    'opacity': 1.0,
    'isVisible': True,
    'isExpanded': False,
    'isLegendExpanded': False,
    'minScale': 0.0,
    'maxScale': 0.0,
    'isBasemap': False,
    'children': None}],
  'bookmarks': None},
 'layersCount': 1,
 'name': 'username.infrastructure_map',
 'alias': 'Инфраструктура',
 'owner': 'username',
 'description': 'Карта городской инфраструктуры (здания и сооружения, дороги, коммуникации)',
 'preview': None,
 'createdDate': '2023-11-29T11:54:02.289284Z',
 'changedDate': '2023-11-29T11:54:02.289285Z',
 'permissions': 'read,write,configure',
 'acl': {'data': [{'role': '__username',
    'permissions': 'read,write,configure'}]},
 'icon': None,
 'invisibleInCatalog': False}
{% endhighlight %}
</details>