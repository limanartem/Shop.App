# Build status

![[build status](https://github.com/limanartem/Shop.App/actions/workflows/nodejs.yml)](https://github.com/limanartem/Shop.App/actions/workflows/nodejs.yml/badge.svg)

# Shop.App
Prototype of the shop app implementation as a playground for integration of different distributed components

# Project setup
Project is setup as a monorepo using npm workspaces. This is mainly relevant for node.js based projects, but other (e.g. .net projects) would follow same structure.

* All standalone applications are placed in `/apps` folder and do not depend on each other from package reference perspective
* All packages that are re-usable across different apps are located in `/packages` and for node.js projects referenced using workspace local reference
  * Each package from the `/packages` folder has to be built before consuming project as it will depend on `@package-name/dist` existence
  * For docker environment this is solved by creating base image `shop.app.packages`, which other Dockerfile files can use as a base, since it will already have packages pre-built and placed into /app/packages folder inside the docker image (see example `apps/shop.app.orders.api/Dockerfile`)

# Setup with the docker
* `.env` file contains most of environment variables used bu different docker services
* by default
* `docker-compose up --build -d` - starts all containers and rebuilds them before that
* once started web app will be available on `http://localhost:3000/`
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