---
layout: default
title: EverGIS API
has_children: true
has_toc: false
nav_order: 3
---

# EverGIS API
Работа EverGIS API основывается на выполнении сервером каждой элементарной операции после получения соответсвующего ей HTTP-запроса, содержащего необходимые параметры и данные.

<!-- Здесь будет что-то вроде списка полезных кейсов, которые либо вообще нельзя сделать в интерфейсе, либо с использованием API они сильно проще, по каждому будет отдельная страница. Но сначала эти кейсы надо придумать -->

## Основные HTTP-методы, используемые EverGIS API:

- **GET** - запрашивает ресурс, расположенный по указанному URL;
- **POST** - отправляет данные на сервер;
- **DELETE** - удаляет указанный ресурс;
- **PATCH** - вносит частичные изменения в указанный ресурс;
- **PUT** - создает новый ресурс.

[Подробнее об HTTP-методах](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods){:target="_blank"}

В EverGIS API ресурсом, к которому обращается тот или иной запрос, может быть любая сущность, которой оперирует серверная часть системы: пользователь, слой, таблица, карта, параметры стилей и др.

Методы **POST**, **PATCH** и **PUT** подразумевают передачу серверу данных, необходимых для выполнения операции (например, заполненная форма авторизации или описание стиля слоя), в теле запроса. В EverGIS API передача данных, как правило, осуществляется в формате JSON:

```
POST {host}/account/login
Content-Type: application/json
{
    "username": "username",
    "password": "password"
}
```

**GET** и **DELETE** лишь указывают на запрашиваемый или удаляемый ресурс в его URL. Также в URL могут быть указаны некоторые параметры запроса, к примеру, логин пользователя или системное имя слоя. К примеру, запрос `GET {host}/layers/{layer_name}` возвращает параметры и метаданные указанного слоя.

Работа с большинством запросов возможна только после авторизации, создания пользовательской сессии и получения JWT-токена, который "прикрепляется" к каждому запросу и позволяет серверу определять, от лица какого пользователя производится запрос. [Подробнее об авторизации](/api/login.html)

## Для работы с HTTP-запросами можно использовать:
- Библиотеки языков программирования:
    - Python ([requests](https://requests.readthedocs.io/en/latest/){:target="_blank"}). Удобнее всего работать с EverGIS API в Python с помощью [Jupyter Notebook](https://jupyter.org/){:target="_blank"} или [JupyterLab](https://jupyterlab.readthedocs.io/en/latest/){:target="_blank"} благодаря интерактивности и возможности выполнения кода в виде отдельных блоков.
    - [JavaScript (Ajax, jQuery, fetch, Axios)](https://www.freecodecamp.org/news/here-is-the-most-popular-ways-to-make-an-http-request-in-javascript-954ce8c95aaa/){:target="_blank"}
    - R ([request](https://www.rdocumentation.org/packages/request/versions/0.1.0){:target="_blank"}, [httr2](https://httr2.r-lib.org/){:target="_blank"})
- Десктопные приложения:
    - [Postman](https://www.postman.com/downloads/){:target="_blank"}
    - [Paw](https://paw.cloud/){:target="_blank"}
    - [Insomnia](https://insomnia.rest){:target="_blank"}
- Утилиты командной строки:
    - [cURL](https://curl.se/){:target="_blank"}
    - [http-console](https://github.com/cloudhead/http-console){:target="_blank"} 
    - [HTTPie](https://httpie.io/){:target="_blank"}
    - [http-prompt](https://github.com/httpie/http-prompt){:target="_blank"}

