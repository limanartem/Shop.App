# Stage 1: Build the app
FROM shop.app.packages as builder
WORKDIR /app/apps/shop.app.auth.api
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build for prod env
FROM node:21.1.0-slim 
WORKDIR /app/apps/shop.app.auth.api
COPY --from=builder /app/apps/shop.app.auth.api/dist /app/apps/shop.app.auth.api/dist
# Adding shared packages
COPY --from=builder /app/packages ../../packages

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev
#COPY . .

EXPOSE 3003

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]