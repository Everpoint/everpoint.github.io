---
layout: default
title: Авторизация
parent: EverGIS API
nav_order: 1
---

# Авторизация
Для авторизации выполняется **POST**-запрос, содержащий логин и пароль пользователя:
```
POST {host}/account/login
Content-Type: application/json
```
```json
{
    "username": "username",
    "password": "password"
}
```

При авторизации открывается пользовательская сессия, а сервер возвращает [JWT-token](https://jwt.io/){:target="_blank"}, который должен кодировать каждый дальнейший запрос. С помощью этого серверная часть системы определяет, от какого пользователя исходит запрос, есть ли у этого пользователя права на совершение этого запроса и в соответствии с этим формирует ответ. 

При использовании приложений по типу Postman токен сохраняется в виде cookie и прикрепляется к каждому запросу до тех пор, пока пользовательская сессия не будет закрыта. 

При использовании API через Python-библиотеку *requests* можно создать объект класса `requests.Session()`, авторизоваться с помощью метода `requests.Session.post()` и производить все дальнейшие запросы с помощью методов объекта сессии. В данном случае токен будет храниться внутри объекта сессии и также автоматически отправляться на сервер вместе с выполняемыми запросами.
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
getUserInfoUrl = f'{host}/account/{username}'

# авторизация
session = login(username, password)

# запрос в рамках сессии
user_info = session.get(url=getUserInfoUrl).json()
print(user_info)
```