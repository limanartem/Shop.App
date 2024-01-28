# Stage 1: Build the app
FROM shop.app.packages as builder
USER node

WORKDIR /app/apps/shop.app.orders.api
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Build for prod env
FROM node:21.1.0-slim
RUN apt-get update -y
RUN apt-get install -y dumb-init

USER node 
WORKDIR /app/apps/shop.app.orders.api
COPY  --chown=node:node --from=builder /app/apps/shop.app.orders.api/dist /app/apps/shop.app.orders.api/dist
# Adding shared packages
COPY --chown=node:node --from=builder /app/packages ../../packages
ENV NODE_ENV=production
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
# COPY --chown=node:node  . .

EXPOSE 3001


CMD ["dumb-init", "npm", "start"]