* Pre-installed dependecies (required)

  * docker

  * node js v16.19.1

## How to run the app

```
  1. ==> yarn install

  2. ==> yarn listen:dev
```

## How to run database and rabbitmq

```
docker compose up
```

## API Find User
```
  GET /users/
```
* queries

**NOTE**: for the query to work `date` and `month` have to be included. otherwise omit both to get all users.

```js
  {
    date: string | number,
    month: "january" | "february" | "march" | "april" | "may" | "june" | "july" | "august" | "september" | "october" | "november" | "december"
  }
```

## API Create User
```
  POST /users
```

* payload
```js
  {
    "firstName": string,
    "lastName": string,
    "birthdate": date // format YYYY-MM-DD,
    "region": "Europe" | "America" | "Asia" | "Pacific" | "Africa",
    "city": string
  }
```

## API Delete User
```
  DELETE /users/:id
```

* id => id of the selected user