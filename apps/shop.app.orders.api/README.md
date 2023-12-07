# shop.app.orders.api
Provides REST and GraphQL APIs for handling orders - submitting new orders, getting all users order, updating order status by other backend systems, subscribing to order updates

## Requirements
* node >= 21

## Setup
* Ensure that packages from `./packages/*` are built
* `npm i `  to install dependencies
* `npm run start-dev` to build and run app locally


## npm tasks
* `npm run start-dev` - builds and starts local node.js express server
* `npm run codegen` - generates typed GraphQL resolver placed under `./src/express/graphql/__generated__/resolver-types.ts` using config from `apps/shop.app.orders.api/graphql-codegen.config.ts`

## GraphQL playground
Express app exposes GraphQL playground using [graphql-playground-middleware-express](https://www.npmjs.com/package/graphql-playground-middleware-express) package, which currently is not maintained and uses express v4.16. 

Once express server started playground is accessible via http://localhost:3001/playground 

To authentication use 
```json
{"Authorization": "Bearer <token>"}
```
, where <token> was acquired from `shop.app.auth.api` service, e.g.

```shell
curl --location 'http://localhost:3003/auth/signin' \
--header 'Referer: http://localhost:3000/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "formFields": [
        {
            "id": "email",
            "value": "..."
        },
        {
            "id": "password",
            "value": "..."
        }
    ]
}'
```

## Environment variables
 
 * `AUTH_API_URL`: The URL for the authentication API.
 * `AUTH_CORE_DOMAIN`: The URL for the authentication core API.
 * `CATALOG_API_URL`: The URL for the catalog API.
 * `MONGO_DB_PASSWORD`: The password for the MongoDB database.
 * `MONGO_DB_USERNAME`: The username for the MongoDB database.
 * `MONGODB_URL`: The URL for the MongoDB server.
 * `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: The host, port, and password for the Redis server.
 * `WEB_SERVER_PORT`: The port number for the web server.
