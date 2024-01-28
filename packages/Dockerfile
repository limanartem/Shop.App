FROM node:21.1.0-slim

WORKDIR /app/packages/shop.app.lib.express
COPY ./shop.app.lib.express .
RUN npm install
ENV NODE_ENV=production
RUN npm run build


WORKDIR /app/packages/shop.app.lib.messaging
COPY ./shop.app.lib.messaging .
ENV NODE_ENV=
RUN npm install
ENV NODE_ENV=production
RUN npm run build



WORKDIR /app/packages/shop.app.lib.client-data
COPY ./shop.app.lib.client-data .
ENV NODE_ENV=
RUN npm install
ENV NODE_ENV=production
RUN npm run build
