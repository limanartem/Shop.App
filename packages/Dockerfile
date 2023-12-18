FROM node:21.1.0-slim
WORKDIR /app/packages/shop.app.lib.express
COPY ./shop.app.lib.express .
RUN npm install
RUN npm run build


WORKDIR /app/packages/shop.app.lib.messaging
COPY ./shop.app.lib.messaging .
RUN npm install
RUN npm run build



WORKDIR /app/packages/shop.app.lib.client-data
COPY ./shop.app.lib.client-data .
RUN npm install
RUN npm run build
