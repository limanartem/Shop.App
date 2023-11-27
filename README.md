# Shop.App
Prototype of the shop app implementation as a playground for integration of different distributed components

# Setup
* `docker-compose up --build -d` - starts all containers and rebuilds them before that
* once started web app will be available on `http://localhost:3000/`
* each app can be started from their /apps folder by running `npm run start`
* from the root folder apps can also be started, e.g. `npm run start-web` would start shop.app.web
* * when running app from cli, make sure to stop corresponding container as this could cause port conflicts



# Docker compose commands
* `docker-compose down -v {service name}` - takes down service volume, e.g. if need to re-run init scripts for database
* `docker-compose up --build -d {service name}` - start/restart single container
* `docker-compose build --no-cache` - rebuilds all containers w/u using cache
* `docker-compose up --build` - starts all containers and rebuilds them


# Architecture Overview
![Architecture Overview](media/Shop.App.Architecture_1.png)