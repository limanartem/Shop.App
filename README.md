# Build status

<a href="https://github.com/limanartem/Shop.App/actions/workflows/nodejs.yml" target="_blank"><img src="https://github.com/limanartem/Shop.App/actions/workflows/nodejs.yml/badge.svg" /></a>



# Shop.App
Prototype of the shop app implementation as a playground for integration of different distributed components

# Project setup
Project is setup as a monorepo using npm workspaces. This is mainly relevant for node.js based projects, but other (e.g. .net projects) would follow same structure.

* All standalone applications are placed in `/apps` folder and do not depend on each other from package reference perspective
* All packages that are re-usable across different apps are located in `/packages` and for node.js projects referenced using workspace local reference
  * Each package from the `/packages` folder has to be built before consuming project as it will depend on `@package-name/dist` existence
  * For docker environment this is solved by creating base image `shop.app.packages`, which other Dockerfile files can use as a base, since it will already have packages pre-built and placed into /app/packages folder inside the docker image (see example `apps/shop.app.orders.api/Dockerfile`)

# Setup with the docker
* `.env` file contains most of environment variables used by different docker services
* `docker-compose up --build -d` - starts all containers rebuilding them upfornt
* once started web app will be available on `http://localhost:3000/`
  * if app should be accessible from other computer in the local network, change all `localhost` in `.env` file to your local IP address, e.g. `192.168.0.1`, so that CORS is correctly configured for APIs 
* each app can be started from their /apps folder by running `npm run start`
  * app may require some env variables for external dependencies, if you are running them in container maker sure they expose ports as some services are placed in private network and do not expose ports to the host
* from the root folder apps can also be started, e.g. `npm run start-web` would start shop.app.web
  * when running app from cli, make sure to stop corresponding container as this could cause port conflicts


# Docker compose commands cheat-shit
* `docker-compose down -v {service name}` - takes down service volume, e.g. if need to re-run init scripts for database
* `docker-compose up --build -d {service name}` - start/restart single container
* `docker-compose build --no-cache` - rebuilds all containers w/u using cache
  * add `--progress plain ` to see more command outputs
* `docker-compose up --build` - starts all containers and rebuilds them


# Architecture Overview
![Architecture Overview](media/Shop.App.Architecture_1.png)

## Application details
### [shop.app.web](https://github.com/limanartem/Shop.App/tree/master/apps/shop.app.web)
Main front-end application built using React, Redux, CRA etc
### [shop.app.auth.api](https://github.com/limanartem/Shop.App/tree/master/apps/shop.app.auth.api)
Authentication provider API built on top of https://supertokens.io open-source authentication framework
### [shop.app.catalog.api](https://github.com/limanartem/Shop.App/tree/master/apps/shop.app.catalog.api)
REST API services providing access to shop catalog - product categories, products etc. Built using [.net minimal api](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-8.0). API does not require authentication
### [shop.app.orders.api](https://github.com/limanartem/Shop.App/tree/master/apps/shop.app.orders.api)
REST API & Grapql services for orders submission and retriiaval. Built based on node.js running [express](https://expressjs.com) app.

Endpoints consumed by `shop.app.web` frontend require user to be authenticated and accept bearer token issued by `shop.app.auth.api` during login process

Some endpoints are only available for backend-to-backend communucation, e.g. changing order status from order processing work-loads. There is special technicl API user configured which has required `role` that would allow user acces these APIs

### [shop.app.orders.processing](https://github.com/limanartem/Shop.App/tree/master/apps/shop.app.orders.processing)
node.js based app that simulates order processing flow by updating its status after some time - new order processing, payment processing and dispatching. 

At each step order is placed in message queue and picked by order processing instance. As a result order status is changed over time and can be refreshed on UI
