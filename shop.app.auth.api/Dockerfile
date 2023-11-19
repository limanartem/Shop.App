# Stage 1: Build the app
FROM node:21.1.0-slim as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build for prod env
FROM node:21.1.0-slim 
WORKDIR /app
COPY --from=builder /app/dist /app/dist
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev
#COPY . .

EXPOSE 3003

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]