FROM node:21.1.0-slim
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run tsc

EXPOSE 3003

#CMD ["npm", "run", "tsc"]
CMD ["npm", "start"]