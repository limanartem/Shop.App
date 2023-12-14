FROM shop.app.packages as builder

# Stage 1: Build the app
WORKDIR /app/apps/shop.app.orders.processing
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build for prod env
FROM node:21.1.0-slim 
WORKDIR /app/apps/shop.app.orders.processing
COPY --from=builder /app/apps/shop.app.orders.processing/dist /app/apps/shop.app.orders.processing/dist
# Adding shared packages
COPY --from=builder /app/packages ../../packages
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
#COPY . .

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]