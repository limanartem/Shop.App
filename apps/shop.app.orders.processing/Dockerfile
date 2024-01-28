FROM shop.app.packages as builder
USER node

# Stage 1: Build the app
WORKDIR /app/apps/shop.app.orders.processing
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build for prod env
FROM node:21.1.0-slim 
RUN apt-get update -y
RUN apt-get install -y dumb-init
USER node

WORKDIR /app/apps/shop.app.orders.processing
COPY --chown=node:node --from=builder /app/apps/shop.app.orders.processing/dist /app/apps/shop.app.orders.processing/dist
# Adding shared packages
COPY --chown=node:node --from=builder /app/packages ../../packages
ENV NODE_ENV=production
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

CMD ["dumb-init", "npm", "start"]